import { ReactNode } from "react"
import { Metadata } from "next/types"
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password.form"
import { ROUTE_RESET_PASSWORD } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_RESET_PASSWORD.TITLE
}

export default function ResetPasswordPage(): ReactNode {
  return (
    <>
      <h2 className="my-8 text-4xl">{ROUTE_RESET_PASSWORD.TITLE}</h2>
      <ResetPasswordForm />
    </>
  )
}
