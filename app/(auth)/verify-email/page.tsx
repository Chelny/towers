import { ReactNode } from "react"
import { Metadata } from "next/types"
import { VerifyEmailForm } from "@/app/(auth)/verify-email/verify-email.form"
import { ROUTE_VERIFY_EMAIL } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_VERIFY_EMAIL.TITLE
}

export default function VerifyEmailPage(): ReactNode {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_VERIFY_EMAIL.TITLE}</h2>
      <VerifyEmailForm />
    </>
  )
}
