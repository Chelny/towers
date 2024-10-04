import { ReactNode } from "react"
import RoomSidebar from "@/components/game/RoomSidebar"

type ProtectedLayoutProps = {
  children: ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps): ReactNode {
  return (
    <div className="flex h-dvh">
      <RoomSidebar />
      <div className="flex-1 p-4 overflow-x-hidden overflow-y-auto">{children}</div>
    </div>
  )
}
