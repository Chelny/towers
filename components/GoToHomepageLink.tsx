import { ReactNode } from "react"
import { Trans } from "@lingui/react/macro"
import Anchor from "@/components/ui/Anchor"
import { ROUTE_HOME } from "@/constants/routes"

export default function GoToHomepageLink(): ReactNode {
  return (
    <Anchor href={ROUTE_HOME.PATH} className="mt-6">
      <Trans>Go to homepage</Trans>
    </Anchor>
  )
}
