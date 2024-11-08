import { NextRequest } from "next/server"
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    username: string
  }
  /**
   * The shape of the account object returned in the OAuth providers' `account` callback,
   * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
   */
  interface Account {}

  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: {
      id: string
      username: string
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
    account: Account | null
    isNewUser: boolean
    // error?: "GoogleRefreshTokenError" | "GitHubRefreshTokenError"
  }

  interface NextAuthRequest extends NextRequest {
    auth: Session | null
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string
    sub: string
    email: string
    username: string
    account: Account | null
    isNewUser: boolean
    // sessionId: string
  }
}

// Make the getCsrfToken accessible outside of next-auth package
declare module "next-auth/react" {
  function getCsrfToken(): Promise<string>
}
