"use client"

import { ReactNode } from "react"
import { Trans } from "@lingui/react/macro"
import Banner from "@/components/Banner"
import { RoomPlainObject } from "@/server/towers/classes/Room"
import { TablePlainObject } from "@/server/towers/classes/Table"

type TableHeaderProps = {
  room?: RoomPlainObject
  table?: TablePlainObject
}

export default function TableHeader({ room, table }: TableHeaderProps): ReactNode {
  const tableNumber: number | undefined = table?.tableNumber
  const tableHostUsername: string | null | undefined = table?.host?.user?.username

  return (
    <div className="[grid-area:banner] flex justify-between items-center gap-6">
      <div className="p-4">
        <h1 className="text-3xl">
          <Trans>
            Table: {tableNumber} - Host: {tableHostUsername}
          </Trans>
        </h1>
        <h2 className="text-lg">{room?.name}</h2>
      </div>
      <Banner />
    </div>
  )
}
