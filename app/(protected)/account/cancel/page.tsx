import { ReactNode } from "react"
import { Metadata } from "next"
import { CancelAccountForm } from "@/app/(protected)/account/cancel/cancel.form"
import { ROUTE_CANCEL_ACCOUNT } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_CANCEL_ACCOUNT.TITLE
}

export default async function CancelAccount(): Promise<ReactNode> {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_CANCEL_ACCOUNT.TITLE}</h2>
      <CancelAccountForm />
    </>
  )
}
