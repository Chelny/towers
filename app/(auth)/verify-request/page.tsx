import { ReactNode } from "react"
import { Metadata } from "next"
import GoToHomepageLink from "@/components/GoToHomepageLink"
import { ROUTE_VERIFY_REQUEST } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_VERIFY_REQUEST.TITLE,
}

export default function VerifyRequestPage(): ReactNode {
  return (
    <>
      <h5 className="mb-4 text-3xl">Check your email</h5>
      <p>A sign in link has been sent to your email address.</p>
      <GoToHomepageLink />
    </>
  )
}
