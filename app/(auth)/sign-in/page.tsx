import { ReactNode } from "react"
import { Metadata } from "next/types"
import { SignInForm } from "@/app/(auth)/sign-in/sign-in.form"
import { ROUTE_SIGN_IN } from "@/constants"

export const metadata: Metadata = {
  title: ROUTE_SIGN_IN.TITLE
}

export default function SignInPage(): ReactNode {
  return (
    <>
      <h2 className="my-8 text-4xl">{ROUTE_SIGN_IN.TITLE}</h2>
      <SignInForm />
    </>
  )
}
