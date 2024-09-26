import { ReactNode } from "react"
import { Metadata } from "next/types"
import { ConfirmEmailChangeForm } from "@/app/(auth)/confirm-email-change/confirm-email-change.form"
import { ROUTE_CONFIRM_EMAIL_CHANGE } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_CONFIRM_EMAIL_CHANGE.TITLE
}

export default function ConfirmEmailChangePage(): ReactNode {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_CONFIRM_EMAIL_CHANGE.TITLE}</h2>
      <ConfirmEmailChangeForm />
    </>
  )
}
