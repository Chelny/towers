import { PropsWithChildren, ReactNode } from "react"

type AccountLayoutProps = PropsWithChildren<{}>

export default function AccountLayout({ children }: AccountLayoutProps): ReactNode {
  return <div className="max-w-[1024px] mx-auto">{children}</div>
}
