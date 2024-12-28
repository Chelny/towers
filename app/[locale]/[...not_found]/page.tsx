import type { PropsWithChildren, ReactElement, ReactNode } from "react"
import { notFound } from "next/navigation"
import { I18n, MessageDescriptor } from "@lingui/core"
import { initLingui } from "@/app/init-lingui"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb"
import { ROUTE_HOME, ROUTES } from "@/constants/routes"

type NotFoundProps = {
  params: Promise<Params>
}

export default async function NotFound({ params }: NotFoundProps): Promise<ReactNode> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  if (!isValidRoute(routeParams.not_found)) {
    notFound() // Redirect to a 404 page if the route is invalid
  }

  const breadcrumbItems: ReactElement[] = []
  let breadcrumbPage: ReactElement = <></>

  for (let i = 0; i < routeParams.not_found.length; i++) {
    const route: string = routeParams.not_found[i]
    const href: string = `/${routeParams.not_found.at(0)}/${route}`

    if (i === routeParams.not_found.length - 1) {
      breadcrumbPage = (
        <BreadcrumbItem>
          <BreadcrumbPage>{route}</BreadcrumbPage>
        </BreadcrumbItem>
      )
    } else {
      breadcrumbItems.push(
        <>
          <BreadcrumbItem key={href}>
            <BreadcrumbLink href={href}>{route}</BreadcrumbLink>
          </BreadcrumbItem>
        </>,
      )
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={ROUTE_HOME.PATH}>{i18n._(ROUTE_HOME.TITLE)}</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems}
        <BreadcrumbSeparator />
        {breadcrumbPage}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function isValidRoute(not_found: string[]): boolean {
  if (!not_found || not_found.length === 0) return false
  return not_found.every((segment: string) =>
    ROUTES.map((route: { TITLE: MessageDescriptor; PATH: string }) => route.PATH).includes(segment),
  )
}
