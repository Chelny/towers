import { NextResponse } from "next/server"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { TowersGameUser, User, UserStatus } from "@prisma/client"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Passkey from "next-auth/providers/passkey"
import Resend from "next-auth/providers/resend"
import { POST } from "@/app/api/sign-in/route"
import { ROUTE_AUTH_ERROR, ROUTE_SIGN_IN } from "@/constants"
import { prisma, sendVerificationRequest } from "@/lib"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
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
      sendVerificationRequest({ identifier: email, url, provider: { from, apiKey } }) {
        sendVerificationRequest({ identifier: email, provider: { from, apiKey }, url })
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
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 1 Day
  },
  callbacks: {
    async authorized({ auth }) {
      // console.log("CHELNY authorized auth", auth)
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    },
    async jwt({ token, user, trigger }) {
      // console.log("CHELNY jwt token", token)
      // console.log("CHELNY jwt user", user)

      if (user) {
        token.username = user.username
        token.picture = user.image

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

      // if (trigger === "update" && token.sub) {
      //   const updatedUser: User | null = await prisma.user.findUnique({
      //     where: {
      //       id: token.sub
      //     }
      //   })

      //   if (updatedUser) {
      //     user.name = updatedUser.name
      //     user.email = updatedUser.email
      //     user.username = updatedUser.username
      //     user.image = updatedUser.image
      //   }
      // }

      // console.log("CHELNY token=", token)
      return token
    },
    async session({ session, token, trigger, newSession }) {
      // console.log("CHELNY session session", session)
      // console.log("CHELNY session token", token)
      // console.log("CHELNY session newSession", newSession)

      if (token) {
        session.user.username = token.username
        session.user.image = token.picture
        session.user.towersUserId = token.towersUserId
      }

      // TODO:
      // if (trigger === "update" && newSession?.user.name) {
      //   // You can update the session in the database if it's not already updated.
      //   // await adapter.updateUser(session.user.id, { name: newSession.name })

      //   // Make sure the updated value is reflected on the client
      //   session.user.name = newSession.user.name
      // }

      // console.log("CHELNY session=", session)
      return session
    }
  },
  events: {
    async linkAccount({ user }) {
      // console.log("CHELNY events linkAccount user", user)
      // console.log("CHELNY events linkAccount account", account)

      // Set random username for OAuth accounts
      if (!user.username) {
        const emailPrefix: string = user.email?.split("@")[0] as string
        const randomSuffix: number = Math.floor(1000 + Math.random() * 9000)
        const generatedUsername = `${emailPrefix}${randomSuffix}`
        user.username = generatedUsername
      }

      const updatedUser: User = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          username: user.username,
          isOnline: true,
          lastActiveAt: new Date(),
          status: UserStatus.ACTIVE
        }
      })

      const towersGameUser: TowersGameUser = await prisma.towersGameUser.create({
        data: {
          userId: updatedUser.id
        }
      })

      user.towersUserId = towersGameUser.id
    }
  },
  pages: {
    signIn: ROUTE_SIGN_IN.PATH,
    error: ROUTE_AUTH_ERROR.PATH
  }
  // experimental: { enableWebAuthn: true }
})
