import { ReactNode } from "react"
import Anchor from "@/components/ui/Anchor"
import { ROUTE_HOME } from "@/constants/routes"

export default function GoToHomepageLink(): ReactNode {
  return (
    <Anchor href={ROUTE_HOME.PATH} className="mt-6">
      Go to homepage
    </Anchor>
  )
}
