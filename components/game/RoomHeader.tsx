"use client"

import { ReactNode } from "react"
import clsx from "clsx/lite"
import Banner from "@/components/Banner"
import { RoomPlainObject } from "@/server/towers/classes/Room"

type RoomHeaderProps = {
  room?: RoomPlainObject
}

export default function RoomHeader({ room }: RoomHeaderProps): ReactNode {
  return (
    <div className="[grid-area:banner]">
      <div className="flex justify-between items-center gap-6">
        <div>
          <h1 className="p-4 text-4xl">{room?.name}</h1>
        </div>
        <Banner />
      </div>

      <div className={clsx("px-4 py-1 bg-amber-500 text-end", "dark:bg-dark-game-orange-top-bar-background")}>
        &nbsp;
      </div>
    </div>
  )
}
