"use client" // Error components must be Client Components

import { ReactNode, useEffect } from "react"
import { Trans } from "@lingui/react/macro"
import Button from "@/components/ui/Button"
import { logger } from "@/lib/logger"

type RootErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: RootErrorProps): ReactNode {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center max-w-sm text-center">
        <h1 className="mb-4 text-3xl">
          <Trans>Something went wrong</Trans>
        </h1>
        <Button
          className="mt-6"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          <Trans>Try again</Trans>
        </Button>
      </div>
    </div>
  )
}
