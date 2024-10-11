import { NextResponse } from "next/server"
import { IRoomListItem, IRoomListItemWithUsersCount } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
  const rooms: IRoomListItem[] = await prisma.towersRoom.findMany({
    include: {
      userProfiles: {
        select: {
          id: true
        },
        distinct: ["id"]
      }
    }
  })

  const roomsWithUsersCount: IRoomListItemWithUsersCount[] = rooms.map((room: IRoomListItem) => ({
    ...room,
    usersCount: room.userProfiles.length
  }))

  return NextResponse.json(
    {
      success: true,
      data: roomsWithUsersCount
    },
    { status: 200 }
  )
}
