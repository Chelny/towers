import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { ROUTE_SIGN_IN } from "@/constants/routes"

export default function Home(): ReactNode {
  redirect(ROUTE_SIGN_IN.PATH)
}
