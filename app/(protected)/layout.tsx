import { PropsWithChildren, ReactNode } from "react"
import Sidebar from "@/components/Sidebar"

type ProtectedLayoutProps = PropsWithChildren<{}>

export default function ProtectedLayout({ children }: ProtectedLayoutProps): ReactNode {
  return (
    <div className="flex h-dvh">
      <Sidebar />
      <div className="relative flex-1 p-4 overflow-x-hidden overflow-y-auto">{children}</div>
    </div>
  )
}
