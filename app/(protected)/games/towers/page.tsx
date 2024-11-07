import { ReactNode } from "react"
import type { Metadata } from "next"
import { NextResponse } from "next/server"
import { ITowersRoomWithUsersCount, ITowersUserProfile, TowersRoom, TowersTable } from "@prisma/client"
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
    const room: TowersRoom | null = await prisma.towersRoom.findUnique({
      where: { id: searchParams.room as string }
    })

    title = `Room: ${room?.name}`

    if (searchParams.table) {
      const table: TowersTable | null = await prisma.towersTable.findUnique({
        where: { id: searchParams.table as string }
      })

      if (table) {
        const tableHost: ITowersUserProfile | null = await prisma.towersUserProfile.findUnique({
          where: { userId: table?.hostId },
          include: { user: true }
        })

        if (tableHost) {
          title += ` - Table: ${table.tableNumber} - Host: ${tableHost.user.username}`
        }
      }
    }
  }

  return {
    title
  }
}

export default async function Towers({ searchParams }: PageProps): Promise<ReactNode> {
  const roomId: string = searchParams.room as string
  const tableId: string = searchParams.table as string

  if (!roomId) {
    const response: NextResponse = await GET()
    const data = await response.json()
    const rooms: ITowersRoomWithUsersCount[] = data.data

    return (
      <>
        <h2 className="mb-8 text-3xl">{ROUTE_TOWERS.TITLE}</h2>
        <RoomsList rooms={rooms} />
      </>
    )
  }

  return <TowersPageContent roomId={roomId} tableId={tableId} />
}
