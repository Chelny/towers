import { ReactNode } from "react"
import { I18n } from "@lingui/core"
import { initLingui } from "@/app/init-lingui"
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb"
import { ROUTE_HOME, ROUTE_SIGN_IN_WITH_MAGIC_LINK } from "@/constants/routes"

type BreadcrumbSlotProps = {
  params: Promise<Params>
}

export default async function BreadcrumbSlot({ params }: BreadcrumbSlotProps): Promise<ReactNode> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  return (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href={ROUTE_HOME.PATH}>{i18n._(ROUTE_HOME.TITLE)}</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{i18n._(ROUTE_SIGN_IN_WITH_MAGIC_LINK.TITLE)}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  )
}
