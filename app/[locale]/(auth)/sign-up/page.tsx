import { ReactNode } from "react"
import { Metadata } from "next/types"
import { I18n } from "@lingui/core"
import { SignUpForm } from "@/app/[locale]/(auth)/sign-up/sign-up.form"
import { initLingui } from "@/app/init-lingui"
import { ROUTE_SIGN_UP } from "@/constants/routes"

type SignUpProps = {
  params: Promise<Params>
}

export async function generateMetadata({ params }: SignUpProps): Promise<Metadata> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  return {
    title: i18n._(ROUTE_SIGN_UP.TITLE),
  }
}

export default async function SignUp({ params }: SignUpProps): Promise<ReactNode> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  return (
    <>
      <h1 className="mb-4 text-3xl">{i18n._(ROUTE_SIGN_UP.TITLE)}</h1>
      <SignUpForm locale={routeParams.locale} />
    </>
  )
}
