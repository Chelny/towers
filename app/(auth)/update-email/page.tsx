import { ReactNode } from "react"
import { Metadata } from "next/types"
import { UpdateEmailForm } from "@/app/(auth)/update-email/update-email.form"
import { ROUTE_UPDATE_EMAIL } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_UPDATE_EMAIL.TITLE
}

export default function UpdateEmailPage(): ReactNode {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_UPDATE_EMAIL.TITLE}</h2>
      <UpdateEmailForm />
    </>
  )
}
