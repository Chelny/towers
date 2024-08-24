import { NextRequest, NextResponse } from "next/server"
import { RoomChatWithTowersGameUser } from "@/interfaces"
import prisma from "@/lib"

export async function GET(_: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const roomChat: RoomChatWithTowersGameUser[] = await prisma.roomChat.findMany({
    where: {
      roomId: roomId,
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    },
    include: {
      towersGameUser: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 100
  })

  return NextResponse.json(
    {
      success: true,
      data: {
        roomId,
        roomChat
      }
    },
    { status: 200 }
  )
}
