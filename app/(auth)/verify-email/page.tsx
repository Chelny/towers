import { ReactNode } from "react"
import { Metadata } from "next/types"
import { VerifyEmailForm } from "@/app/(auth)/verify-email/verify-email.form"
import { ROUTE_VERIFY_EMAIL } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_VERIFY_EMAIL.TITLE
}

export default function VerifyEmailPage(): ReactNode {
  return (
    <>
      <h2 className="my-8 text-4xl">{ROUTE_VERIFY_EMAIL.TITLE}</h2>
      <VerifyEmailForm />
    </>
  )
}
