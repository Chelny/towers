import {
  adminClient,
  customSessionClient,
  inferAdditionalFields,
  magicLinkClient,
  passkeyClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient, ErrorContext } from "better-auth/react"
import type { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    customSessionClient<typeof auth>(),
    usernameClient(),
    magicLinkClient(),
    passkeyClient(),
    adminClient(),
  ],
  fetchOptions: {
    onError: async (context: ErrorContext) => {
      const { response } = context
      if (response.status === 429) {
        const retryAfter: string | null = response.headers.get("X-Retry-After")
        logger.error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`)
      }
    },
  },
})

export type Session = typeof authClient.$Infer.Session
