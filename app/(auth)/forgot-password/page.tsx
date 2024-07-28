import { ReactNode } from "react"
import { Metadata } from "next/types"
import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password.form"
import { ROUTE_FORGOT_PASSWORD } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_FORGOT_PASSWORD.TITLE
}

export default function ForgotPasswordPage(): ReactNode {
  return (
    <>
      <h2 className="my-8 text-4xl">{ROUTE_FORGOT_PASSWORD.TITLE}</h2>
      <ForgotPasswordForm />
    </>
  )
}
