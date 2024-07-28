import { ReactNode } from "react"
import RoomSidebar from "@/components/RoomSidebar"
import SmallScreenWarning from "@/components/SmallScreenWarning"

type ProtectedLayoutProps = {
  children: ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps): ReactNode {
  return (
    <>
      <SmallScreenWarning />
      <div className="flex h-dvh">
        <RoomSidebar />
        <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      </div>
    </>
  )
}
