import { NextResponse } from "next/server"
import { RoomListItem, TowersUserRoomTable } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
  const rooms: RoomListItem[] = await prisma.room.findMany({
    include: {
      towersUserRoomTables: {
        select: {
          towersUserProfileId: true
        },
        distinct: ["towersUserProfileId"]
      }
    }
  })

  const roomsWithUsersCount = rooms.map((room: RoomListItem) => ({
    ...room,
    usersCount: room.towersUserRoomTables.length
  }))

  return NextResponse.json(
    {
      success: true,
      data: roomsWithUsersCount
    },
    { status: 200 }
  )
}
