import { ReactNode } from "react"
import { Metadata } from "next"
import { DeleteAccountForm } from "@/app/(protected)/account/delete/delete.form"
import { ROUTE_DELETE_ACCOUNT } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_DELETE_ACCOUNT.TITLE,
}

export default async function DeleteAccount(): Promise<ReactNode> {
  return (
    <>
      <h1 className="mb-4 text-3xl">{ROUTE_DELETE_ACCOUNT.TITLE}</h1>
      <DeleteAccountForm />
    </>
  )
}
