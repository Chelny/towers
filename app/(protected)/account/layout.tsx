import { ReactNode } from "react"
import Breadcrumb from "@/components/ui/Breadcrumb"

type AccountLayoutProps = {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps): ReactNode {
  return (
    <div className="h-full bg-neutral-50">
      <div className="max-w-screen-sm px-4">
        <Breadcrumb />
        {children}
      </div>
    </div>
  )
}
