import { ReactNode } from "react"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import GoToHomepageLink from "@/components/GoToHomepageLink"

const errorMap: Record<string, ReactNode> = {
  // There is a problem with the server configuration. Check if your options are correct.
  Configuration: (
    <p>
      There was a problem when trying to authenticate. Please contact us if this error persists.
      <br />
      Unique error code: <code className="rounded-sm p-1">Configuration</code>
    </p>
  ),
  // Usually occurs, when you restricted access through the signIn callback, or redirect callback.
  AccessDenied: (
    <p>
      Access was denied. If you believe this is an error, please contact support.
      <br />
      Unique error code: <code className="rounded-sm p-1">AccessDenied</code>
    </p>
  ),
  // Related to the Email provider. The token has expired or has already been used.
  Verification: (
    <p>
      The verification token has expired or has already been used. Please request a new verification link.
      <br />
      Unique error code: <code className="rounded-sm p-1">Verification</code>
    </p>
  )
}

export default function AuthErrorPage(): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const error: string = searchParams.get("error") as string

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center max-w-sm text-center">
        <h5 className="mb-4 text-3xl">Something went wrong</h5>
        {errorMap[error] ||
          "An unexpected error occurred. Please try again later or contact support if this issue continues."}
        <GoToHomepageLink />
      </div>
    </div>
  )
}
