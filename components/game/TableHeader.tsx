"use client"

import { ReactNode } from "react"
import { ITowersRoom, ITowersTable } from "@prisma/client"

type TableHeaderProps = {
  room: ITowersRoom | null
  table: ITowersTable | null
}

export default function TableHeader({ room, table }: TableHeaderProps): ReactNode {
  return (
    <div className="[grid-area:banner] py-2">
      <h2 className="px-4 pt-4 text-4xl">
        Table: {table?.tableNumber} - Host: {table?.host?.user?.username}
      </h2>
      <h3 className="px-4 text-lg">{room?.name}</h3>
    </div>
  )
}
