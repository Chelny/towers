import { ReactNode, Suspense } from "react"
import { Metadata } from "next/types"
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password.form"
import { ROUTE_RESET_PASSWORD } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_RESET_PASSWORD.TITLE,
}

export default function ResetPasswordPage(): ReactNode {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_RESET_PASSWORD.TITLE}</h2>
      <ResetPasswordFormSection />
    </>
  )
}

function ResetPasswordFormSection(): ReactNode {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
