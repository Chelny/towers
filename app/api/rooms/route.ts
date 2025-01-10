import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { IRoomListItem, ITowersRoomWithUsersCount, ITowersUserRoom } from "@prisma/client"
import { getPrismaError, unauthorized } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
  const session: Session | null = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  try {
    const rooms: IRoomListItem[] = await prisma.towersRoom.findMany({
      include: {
        userRooms: {
          select: {
            userProfileId: true,
          },
        },
      },
    })

    const userRooms: { roomId: string }[] = await prisma.towersUserRoom.findMany({
      where: {
        userProfileId: session.userProfileIds.towers,
      },
      select: {
        roomId: true,
      },
    })

    const userRoomIds: string[] = userRooms.map((towersUserRoom: { roomId: string }) => towersUserRoom.roomId)

    const roomsWithUsersCount: ITowersRoomWithUsersCount[] = rooms.map((room: IRoomListItem) => {
      const { userRooms, ...roomWithoutUserRoomTables } = room
      const usersCount: number = room.userRooms?.length
      const isUserInRoom: boolean = userRoomIds.includes(room.id)

      return {
        ...roomWithoutUserRoomTables,
        usersCount,
        isUserInRoom,
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
