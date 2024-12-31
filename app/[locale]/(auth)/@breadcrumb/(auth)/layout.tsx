import { PropsWithChildren, ReactNode } from "react"

type BreadcrumbLayoutProps = PropsWithChildren<{
  children: ReactNode
}>

export default function BreadcrumbLayout({ children }: BreadcrumbLayoutProps): ReactNode {
  return <>{children}</>
}
