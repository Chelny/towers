"use client"

import { ReactNode } from "react"
import { Trans } from "@lingui/react/macro"
import { ITowersRoom, ITowersTable } from "@prisma/client"
import Banner from "@/components/Banner"

type TableHeaderProps = {
  room: ITowersRoom | null
  table: ITowersTable | null
}

export default function TableHeader({ room, table }: TableHeaderProps): ReactNode {
  const tableNumber: number | undefined = table?.tableNumber
  const tableHostUsername: string | undefined = table?.host?.user?.username

  return (
    <div className="[grid-area:banner] flex justify-between items-center gap-6">
      <div className="p-4">
        <h2 className="text-3xl">
          <Trans>
            Table: {tableNumber} - Host: {tableHostUsername}
          </Trans>
        </h2>
        <h3 className="text-lg">{room?.name}</h3>
      </div>
      <Banner />
    </div>
  )
}
