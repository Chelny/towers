import {
  adminClient,
  customSessionClient,
  inferAdditionalFields,
  magicLinkClient,
  passkeyClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    customSessionClient<typeof auth>(),
    usernameClient(),
    magicLinkClient(),
    passkeyClient(),
    adminClient(),
  ],
  fetchOptions: {
    onError: async (context) => {
      const { response } = context
      if (response.status === 429) {
        const retryAfter: string | null = response.headers.get("X-Retry-After")
        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds.`)
      }
    },
  },
})

export type Session = typeof authClient.$Infer.Session
