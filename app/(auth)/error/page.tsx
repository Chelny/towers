"use client"

import { ReactNode, Suspense } from "react"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import GoToHomepageLink from "@/components/GoToHomepageLink"
import { APP_CONFIG } from "@/constants/app"

const generateErrorMessage = (errorCode: string, message: ReactNode) => (
  <div className="flex flex-col gap-4">
    <p>
      {message} Please try again or{" "}
      <a href={`mailto:${APP_CONFIG.EMAIL.SUPPORT}`} className="towers-link">
        contact our support team
      </a>{" "}
      if the issue persists.
    </p>
    <div>
      Error code: <code className="rounded p-1 bg-gray-200 text-sm">{errorCode}</code>
    </div>
  </div>
)

const errorMap: Record<string, ReactNode> = {
  account_not_linked: generateErrorMessage(
    "account_not_linked",
    <>The user already exists but the account isn’t linked to the provider.</>,
  ),
  unable_to_create_user: generateErrorMessage(
    "unable_to_create_user",
    <>We were unable to create your account at this time.</>,
  ),
}

export default function AuthErrorPage(): ReactNode {
  return (
    <Suspense>
      <ErrorMessage />
    </Suspense>
  )
}

function ErrorMessage(): ReactNode {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const error: string = searchParams.get("error") as string

  return (
    <div className="flex flex-col">
      <h2 className="mb-4 text-3xl">Something went wrong</h2>
      {errorMap[error] || (
        <div>
          An unexpected error occurred. Please try again later or{" "}
          <a href={`mailto:${APP_CONFIG.EMAIL.SUPPORT}`} className="towers-link">
            contact our support team
          </a>{" "}
          if this issue continues.
        </div>
      )}
      <GoToHomepageLink />
    </div>
  )
}
