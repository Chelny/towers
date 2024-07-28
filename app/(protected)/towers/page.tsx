import { ReactNode } from "react"
import type { Metadata } from "next"
import { Room, Table } from "@prisma/client"
import TowersPageContent from "@/components/TowersPageContent"
import { ROUTE_TOWERS } from "@/constants"
import { TowersGameUserWithUser } from "@/interfaces"
import { prisma } from "@/lib"

type PageProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  let title: string = ROUTE_TOWERS.TITLE

  if (searchParams.room) {
    const room: Room | null = await prisma.room.findUnique({
      where: { id: searchParams.room as string }
    })

    title = `Room: ${room?.name}`

    if (searchParams.table) {
      const table: Table | null = await prisma.table.findUnique({
        where: { id: searchParams.table as string }
      })

      if (table) {
        const tableHost: TowersGameUserWithUser | null = await prisma.towersGameUser.findUnique({
          where: { id: table?.hostId },
          include: {
            user: true
          }
        })

        if (tableHost) {
          title += ` - Table: ${table.tableNumber} - Host: ${tableHost.user.username}`
        }
      }
    }
  }

  return {
    title,
    robots: {
      index: false,
      follow: false
    }
  }
}

export default function Towers({ searchParams }: PageProps): ReactNode {
  const roomId: string = searchParams.room as string
  const tableId: string = searchParams.table as string

  if (!roomId) return null
  return <TowersPageContent roomId={roomId} tableId={tableId} />
}
