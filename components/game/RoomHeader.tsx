"use client"

import { ReactNode } from "react"
import { ITowersRoom } from "@prisma/client"
import Banner from "@/components/Banner"

type RoomHeaderProps = {
  room: ITowersRoom | null
}

export default function RoomHeader({ room }: RoomHeaderProps): ReactNode {
  return (
    <div className="[grid-area:banner]">
      <div className="flex justify-between items-center gap-6">
        <div>
          <h2 className="p-4 text-4xl">{room?.name}</h2>
        </div>
        <Banner />
      </div>

      <div className="px-4 py-1 bg-amber-500 text-end">&nbsp;</div>
    </div>
  )
}
