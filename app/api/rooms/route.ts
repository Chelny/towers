import { NextResponse } from "next/server"
import { IRoomListItem, ITowersRoomWithUsersCount } from "@prisma/client"
import { getPrismaError } from "@/lib/api"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
  try {
    const rooms: IRoomListItem[] = await prisma.towersRoom.findMany({
      include: {
        userRoomTables: {
          select: {
            userProfileId: true,
          },
          distinct: ["userProfileId"],
        },
      },
    })

    const roomsWithUsersCount: ITowersRoomWithUsersCount[] = rooms.map((room: IRoomListItem) => {
      const usersCount = room.userRoomTables?.length
      const { userRoomTables, ...roomWithoutUserRoomTables } = room

      return {
        ...roomWithoutUserRoomTables,
        usersCount,
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: roomsWithUsersCount,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
