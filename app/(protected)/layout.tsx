import { PropsWithChildren, ReactNode } from "react"
import { Metadata } from "next"
import Sidebar from "@/components/Sidebar"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}

type ProtectedLayoutProps = PropsWithChildren<{}>

export default function ProtectedLayout({ children }: ProtectedLayoutProps): ReactNode {
  return (
    <div className="flex h-dvh">
      <Sidebar />
      <div className="relative flex-1 p-4 pb-8 overflow-x-hidden overflow-y-auto">{children}</div>
    </div>
  )
}
