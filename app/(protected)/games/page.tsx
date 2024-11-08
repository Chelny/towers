import { ReactNode } from "react"
import { Metadata } from "next"
import { ROUTE_GAMES } from "@/constants/routes"

export const metadata: Metadata = {
  title: ROUTE_GAMES.TITLE,
}

export default function Games(): ReactNode {
  return <>List other games here</>
}
