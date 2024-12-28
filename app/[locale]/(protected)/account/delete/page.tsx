import { ReactNode } from "react"
import { Metadata } from "next"
import { I18n } from "@lingui/core"
import { DeleteAccountForm } from "@/app/[locale]/(protected)/account/delete/delete.form"
import { initLingui } from "@/app/init-lingui"
import { ROUTE_DELETE_ACCOUNT } from "@/constants/routes"

type DeleteAccountProps = {
  params: Promise<Params>
}

export async function generateMetadata({ params }: DeleteAccountProps): Promise<Metadata> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  return {
    title: i18n._(ROUTE_DELETE_ACCOUNT.TITLE),
  }
}

export default async function DeleteAccount({ params }: DeleteAccountProps): Promise<ReactNode> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_DELETE_ACCOUNT.TITLE)}</h1>
      <DeleteAccountForm />
    </>
  )
}
