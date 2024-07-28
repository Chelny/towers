import { ReactNode } from "react"
import { Metadata } from "next/types"
import { SignInWithMagicLinkForm } from "@/app/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.form"
import { ROUTE_SIGN_IN_WITH_MAGIC_LINK } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_SIGN_IN_WITH_MAGIC_LINK.TITLE
}

export default function SignInPage(): ReactNode {
  return (
    <>
      <h2 className="my-8 text-4xl">{ROUTE_SIGN_IN_WITH_MAGIC_LINK.TITLE}</h2>
      <SignInWithMagicLinkForm />
    </>
  )
}
