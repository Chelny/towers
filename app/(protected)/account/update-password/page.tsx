import { ReactNode } from "react"
import { Metadata } from "next"
import { UpdatePasswordForm } from "@/app/(protected)/account/update-password/update-password.form"
import { ROUTE_UPDATE_PASSWORD } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_UPDATE_PASSWORD.TITLE
}

export default async function UpdatePassword(): Promise<ReactNode> {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_UPDATE_PASSWORD.TITLE}</h2>
      <UpdatePasswordForm />
    </>
  )
}
