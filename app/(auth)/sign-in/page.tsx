import { ReactNode } from "react"
import { Metadata } from "next/types"
import { SignInForm } from "@/app/(auth)/sign-in/sign-in.form"
import { ROUTE_SIGN_IN } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_SIGN_IN.TITLE,
}

export default function SignInPage(): ReactNode {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_SIGN_IN.TITLE}</h2>
      <SignInForm />
    </>
  )
}
