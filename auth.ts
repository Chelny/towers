import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { TowersGameUser, User, UserStatus } from "@prisma/client"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
// import Passkey from "next-auth/providers/passkey"
import Resend from "next-auth/providers/resend"
import { POST } from "@/app/api/sign-in/route"
import { ROUTE_AUTH_ERROR, ROUTE_NEW_USER, ROUTE_SIGN_IN, ROUTE_VERIFY_REQUEST } from "@/constants/routes"
import { sendVerificationRequest } from "@/lib/email"
import { getLocation } from "@/lib/geolocation"
import prisma from "@/lib/prisma"
import { generateRandomUsername } from "@/utils/user-utils"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
    // Passkey,
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest({ identifier, url, provider: { from, apiKey } }) {
        sendVerificationRequest({ identifier, provider: { from, apiKey }, url })
      }
    }),
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials) => {
        // @ts-ignore
        const response: NextResponse = await POST(credentials)
        const data = await response.json()
        if (data.success) return data.data.user
        return null
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async authorized({ auth }) {
      // Logged in users are authenticated, otherwise redirect to login page
      if (auth) {
        if (new Date(auth.expires) >= new Date()) {
          return true
        } else {
          await prisma.user.update({
            where: { id: auth?.user.id },
            data: { isOnline: false }
          })
        }
      }

      return false
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.username = user.username
        token.picture = user.image
        token.account = account

        if (user.id && !user.towersUserId) {
          const towersGameUser: TowersGameUser | null = await prisma.towersGameUser.findUnique({
            where: { userId: user.id }
          })

          if (towersGameUser) {
            token.towersUserId = towersGameUser.id
          } else {
            const newTowersGameUser: TowersGameUser = await prisma.towersGameUser.create({
              data: {
                userId: user.id
              }
            })

            token.towersUserId = newTowersGameUser.id
          }
        } else {
          token.towersUserId = user.towersUserId
        }
      }

      if (trigger === "signUp") {
        token.isNewUser = true
      }

      if (trigger === "update" && token.sub) {
        const updatedUser: User | null = await prisma.user.findUnique({
          where: {
            id: token.sub
          }
        })

        if (updatedUser) {
          token.name = updatedUser.name
          token.email = updatedUser.email

          if (updatedUser.username) {
            token.username = updatedUser.username
          }

          token.picture = updatedUser.image
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email
        session.user.username = token.username
        session.user.image = token.picture
        session.user.towersUserId = token.towersUserId
        session.account = token.account
        session.isNewUser = token.isNewUser
      }

      return session
    }
  },
  events: {
    async linkAccount({ user }) {
      // Set random username for OAuth accounts (can be changed after)
      if (!user.username) {
        const emailPrefix: string = user.email?.split("@")[0] as string
        user.username = generateRandomUsername(emailPrefix)
      }

      const updatedUser: User = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          username: user.username,
          isOnline: true,
          status: UserStatus.ACTIVE
        }
      })

      // Create Towers table entry
      const towersGameUser: TowersGameUser = await prisma.towersGameUser.create({
        data: {
          userId: updatedUser.id
        }
      })

      user.towersUserId = towersGameUser.id
    },
    async signIn({ user }) {
      if (user.id) {
        const cookieStore: ReadonlyRequestCookies = cookies()
        const ipAddress: string | null = cookieStore.get("user-ip")?.value || "[unknown]"
        const userAgent: string | null = cookieStore.get("user-agent")?.value || "[unknown]"
        const location: string | null = await getLocation(ipAddress)

        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress,
            userAgent,
            location
          }
        })

        await prisma.user.update({
          where: { id: user.id },
          data: { isOnline: true }
        })
      }
    },
    // @ts-ignore
    async signOut({ token }) {
      if (token) {
        await prisma.user.update({
          where: { id: token.sub },
          data: { isOnline: false }
        })
      }
    }
  },
  pages: {
    newUser: ROUTE_NEW_USER.PATH,
    signIn: ROUTE_SIGN_IN.PATH,
    verifyRequest: ROUTE_VERIFY_REQUEST.PATH,
    error: ROUTE_AUTH_ERROR.PATH
  }
  // experimental: { enableWebAuthn: true },
  // debug: process.env.NODE_ENV !== "production"
})
