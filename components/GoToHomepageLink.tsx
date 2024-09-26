import { ReactNode } from "react"
import Link from "next/link"
import clsx from "clsx/lite"
import { ROUTE_HOME } from "@/constants/routes"

export default function GoToHomepageLink(): ReactNode {
  return (
    <Link className={clsx("text-blue-500 mt-6", "hover:underline")} href={ROUTE_HOME.PATH}>
      Go to homepage
    </Link>
  )
}
