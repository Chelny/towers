import { NextRequest, NextResponse } from "next/server"
import { RoomChat } from "@prisma/client"
import { prisma } from "@/lib"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json()
  const chatMessage: RoomChat = await prisma.roomChat.create({
    data: {
      roomId: data.roomId,
      towersUserId: data.towersUserId,
      message: data.message
    },
    include: {
      towersGameUser: {
        include: {
          user: true
        }
      }
    }
  })

  return NextResponse.json(
    {
      success: true,
      data: chatMessage
    },
    { status: 201 }
  )
}
