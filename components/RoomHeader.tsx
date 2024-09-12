"use client"

import { ReactNode } from "react"
import { useSelector } from "react-redux"
import { RoomWithTablesCount } from "@/interfaces"
import { RootState } from "@/redux/store"

type RoomHeaderProps = {
  room: RoomWithTablesCount | null
}

export default function RoomHeader({ room }: RoomHeaderProps): ReactNode {
  const { isConnected } = useSelector((state: RootState) => state.socket)

  return (
    <div className="py-2">
      <h2 className="p-4 text-4xl">{room?.room?.name}</h2>

      {/* TODO: Testing purpose */}
      <div className="px-4 bg-amber-500">
        <p>Socket status: {isConnected ? "connected" : "disconnected"}</p>
      </div>
    </div>
  )
}
