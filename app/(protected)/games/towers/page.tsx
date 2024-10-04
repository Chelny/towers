import { ReactNode } from "react"
import type { Metadata } from "next"
import { NextResponse } from "next/server"
import { Room, RoomListItemWithUsersCount, Table, TowersUserInformation } from "@prisma/client"
import { GET } from "@/app/api/rooms/route"
import RoomsList from "@/components/game/RoomsList"
import TowersPageContent from "@/components/game/TowersPageContent"
import { ROUTE_TOWERS } from "@/constants/routes"
import prisma from "@/lib/prisma"

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
        const tableHost: TowersUserInformation | null = await prisma.towersUserProfile.findUnique({
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

export default async function Towers({ searchParams }: PageProps): Promise<ReactNode> {
  const roomId: string = searchParams.room as string
  const tableId: string = searchParams.table as string
  const response: NextResponse = await GET()
  const data = await response.json()
  const rooms: RoomListItemWithUsersCount[] = data.data

  if (!roomId) {
    return (
      <>
        <h2 className="mb-8 text-3xl">{ROUTE_TOWERS.TITLE}</h2>
        <RoomsList rooms={rooms} />
      </>
    )
  }

  return <TowersPageContent roomId={roomId} tableId={tableId} />
}
