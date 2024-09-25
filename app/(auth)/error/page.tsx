"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"
import Button from "@/components/ui/Button"
import { ROUTE_HOME } from "@/constants/routes"

enum Error {
  Configuration = "Configuration", // There is a problem with the server configuration. Check if your options are correct.
  AccessDenied = "AccessDenied", // Usually occurs, when you restricted access through the signIn callback, or redirect callback.
  Verification = "Verification", // Related to the Email provider. The token has expired or has already been used.
  // Default = "Default", // Catch all, will apply, if none of the above matched.
}

const errorMap = {
  [Error.Configuration]: (
    <p>
      There was a problem when trying to authenticate. Please contact us if this error persists.
      <br />
      Unique error code: <code className="rounded-sm p-1">Configuration</code>
    </p>
  ),
  [Error.AccessDenied]: (
    <p>
      Access was denied. If you believe this is an error, please contact support.
      <br />
      Unique error code: <code className="rounded-sm p-1">AccessDenied</code>
    </p>
  ),
  [Error.Verification]: (
    <p>
      The verification token has expired or has already been used. Please request a new verification link.
      <br />
      Unique error code: <code className="rounded-sm p-1">Verification</code>
    </p>
  )
}

export default function AuthErrorPage(): ReactNode {
  const router: AppRouterInstance = useRouter()
  const search: ReadonlyURLSearchParams = useSearchParams()
  const error: Error = search.get("error") as Error

  const handleReturnHome = (): void => {
    router.push(ROUTE_HOME.PATH)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center max-w-sm text-center">
        <h5 className="mb-4 text-3xl">Something went wrong</h5>
        {errorMap[error] ||
          "An unexpected error occurred. Please try again later or contact support if this issue continues."}
        <Button type="button" className="mt-6" onClick={handleReturnHome}>
          Return Home
        </Button>
      </div>
    </div>
  )
}
