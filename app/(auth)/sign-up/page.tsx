import { ReactNode } from "react"
import { Metadata } from "next/types"
import { SignUpForm } from "@/app/(auth)/sign-up/sign-up.form"
import { ROUTE_SIGN_UP } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_SIGN_UP.TITLE
}

export default function SignUpPage(): ReactNode {
  return (
    <>
      <h2 className="mb-4 text-3xl">{ROUTE_SIGN_UP.TITLE}</h2>
      <SignUpForm />
    </>
  )
}
