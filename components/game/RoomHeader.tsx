"use client"

import { ReactNode } from "react"
import { ITowersRoom } from "@prisma/client"

type RoomHeaderProps = {
  room: ITowersRoom | null
}

export default function RoomHeader({ room }: RoomHeaderProps): ReactNode {
  return (
    <div className="py-2">
      <h2 className="p-4 text-4xl">{room?.name}</h2>

      <div className="px-4 py-1 bg-amber-500 text-end">&nbsp;</div>
    </div>
  )
}
