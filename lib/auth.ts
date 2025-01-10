import { cookies } from "next/headers"
import { Account, User } from "@prisma/client"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { admin, customSession, magicLink, openAPI, username } from "better-auth/plugins"
import { passkey } from "better-auth/plugins/passkey"
import { APP_CONFIG, APP_COOKIES, COOKIE_PREFIX } from "@/constants/app"
import { getAccountsByUserId } from "@/data/account"
import { getUserById } from "@/data/user"
import { getTowersUserProfileIdByUserId } from "@/data/user-profile"
import {
  sendDeleteUserEmail,
  sendEmailChangeEmail,
  sendEmailVerificationEmail,
  sendMagicLinkEmail,
  sendPasswordResetEmail,
} from "@/lib/email"
import prisma from "@/lib/prisma"
import { generateRandomUsername } from "@/utils/user-utils"

export const auth = betterAuth({
  appName: APP_CONFIG.NAME,
  baseURL: process.env.BASE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
    additionalFields: {
      birthdate: {
        type: "date",
        required: false,
      },
      language: {
        type: "string",
        defaultValue: "en",
      },
      isOnline: {
        type: "boolean",
        defaultValue: false,
      },
      lastActiveAt: {
        type: "date",
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (data) => {
        await sendEmailChangeEmail(data)
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async (data) => {
        await sendDeleteUserEmail(data)
      },
    },
  },
  session: {
    modelName: "Session",
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day (matches freshAge)
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days (total session duration)
    updateAge: 60 * 60 * 24, // Updates session expiration every 1 day
  },
  account: {
    modelName: "Account",
    accountLinking: {
      enabled: true,
    },
  },
  verification: {
    modelName: "Verification",
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async (data) => {
      await sendEmailVerificationEmail(data)
    },
    autoSignInAfterVerification: false,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async (data) => {
      await sendPasswordResetEmail(data)
    },
    resetPasswordTokenExpiresIn: 3600, // 60 minutes
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const username: string = generateRandomUsername(user.email)

          // @ts-ignore
          if (!user.username) {
            const cookiesStore = await cookies()
            cookiesStore.set(APP_COOKIES.NEW_USER, "true")
          }

          return {
            data: {
              ...user,
              // @ts-ignore
              ...(!user.username ? { username } : {}),
              role: "user",
            },
          }
        },
      },
    },
  },
  advanced: {
    generateId: false,
    cookiePrefix: COOKIE_PREFIX,
  },
  rateLimit: {
    storage: "database",
    modelName: "RateLimit",
  },
  plugins: [
    openAPI(), // http://localhost:3000/api/auth/reference
    customSession(async (session) => {
      const user: User | null = await getUserById(session.user.id)
      const accounts: Account[] = await getAccountsByUserId(session.user.id)
      const towersUserProfileId: string | undefined = await getTowersUserProfileIdByUserId(session.user.id)

      return {
        user: {
          ...session.user,
          ...user,
        },
        session: session.session,
        accounts,
        userProfileIds: {
          towers: towersUserProfileId,
        },
      }
    }),
    username(),
    magicLink({
      sendMagicLink: async (data) => {
        await sendMagicLinkEmail(data)
      },
      expiresIn: 600, // 10 minutes
    }),
    passkey({
      rpID: "towers",
      rpName: APP_CONFIG.NAME,
      origin: process.env.BETTER_AUTH_URL,
      schema: {
        passkey: {
          modelName: "Passkey",
          fields: {},
        },
      },
    }),
    admin(),
    nextCookies(), // Make sure this is the last plugin in the array,
  ],
  onAPIError: {
    onError: (error, ctx) => {
      console.error("onAPIError", error)
    },
  },
  logger: {
    disabled: process.env.NODE_ENV === "production",
    level: "debug",
  },
})
