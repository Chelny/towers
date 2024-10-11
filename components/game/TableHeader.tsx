"use client"

import { ReactNode } from "react"
import { ITowersTable } from "@prisma/client"

type TableHeaderProps = {
  table: ITowersTable | null
}

export default function TableHeader({ table }: TableHeaderProps): ReactNode {
  return (
    <div className="[grid-area:banner] py-2">
      <h2 className="px-4 pt-4 text-4xl">
        Table: {table?.tableNumber} - Host: {table?.host.username}
      </h2>
      <h3 className="px-4 text-lg">{table?.room?.name}</h3>
    </div>
  )
}
