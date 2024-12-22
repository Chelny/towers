"use client" // Error components must be Client Components

import { ReactNode, useEffect } from "react"
import Button from "@/components/ui/Button"

type RootErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: RootErrorProps): ReactNode {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center max-w-sm text-center">
        <h2 className="mb-4 text-3xl">Something went wrong</h2>
        <Button
          className="mt-6"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
