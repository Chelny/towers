"use client"

import { ReactNode } from "react"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

// eslint-disable-next-line no-unused-vars
export default function GlobalError({ error, reset }: GlobalErrorProps): ReactNode {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
