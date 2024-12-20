import { Account, User } from "@prisma/client"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { admin, customSession, magicLink, openAPI, passkey, username } from "better-auth/plugins"
import { APP_CONFIG } from "@/constants/app"
import { getAccountsByUserId } from "@/data/account"
import { getUserById } from "@/data/user"
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
      afterDelete: async (user, request) => {
        console.log(`User ${user.email} deleted.`, request)

        if (request) {
          // TODO: Redirect user to / after deletion confirmation
        }
      },
    },
  },
  session: {
    modelName: "Session",
    // cookieCache: {
    //   enabled: true,
    //   maxAge: 60 * 30, // 30 minutes (matches freshAge)
    // },
    // freshAge: 60 * 30, // 30 minutes of inactivity before session expires
    freshAge: 0,
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
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    gitlab: {
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const username: string = generateRandomUsername(user.email.split("@")[0])
          return {
            data: {
              ...user,
              // @ts-ignore
              ...(!user.username ? { username } : {}),
            },
          }
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          const credentialAccountCount: number = await prisma.account.count({
            where: {
              AND: {
                userId: account.userId,
                providerId: "credential",
              },
            },
          })

          const oAuthAccountsCount: number = await prisma.account.count({
            where: {
              AND: {
                userId: account.userId,
                providerId: { not: "credential" },
              },
            },
          })

          const isFirstAccount: boolean = credentialAccountCount === 0 && oAuthAccountsCount === 1

          if (isFirstAccount) {
            console.log(`First account created for user ${account.userId} with provider ${account.providerId}`)
            // TODO: Redirect user to /new-user to complete their profile
          }
        },
      },
    },
  },
  advanced: {
    generateId: false,
    cookiePrefix: "towers",
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

      return {
        user: {
          ...session.user,
          ...user,
        },
        session: session.session,
        accounts,
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
