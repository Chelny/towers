import { ReactNode } from "react"
import { Metadata } from "next"
import { PasswordForm } from "@/app/(protected)/account/password/password.form"
import { ROUTE_UPDATE_PASSWORD } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_UPDATE_PASSWORD.TITLE
}

export default async function Profile(): Promise<ReactNode> {
  return (
    <>
      <h2 className="my-8 text-4xl">{ROUTE_UPDATE_PASSWORD.TITLE}</h2>
      <PasswordForm />
    </>
  )
}
