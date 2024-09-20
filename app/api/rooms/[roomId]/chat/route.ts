import { NextRequest, NextResponse } from "next/server"
import { RoomChat } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { RoomChatWithTowersGameUser } from "@/interfaces"
import prisma from "@/lib"

export async function GET(_: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const chat: RoomChatWithTowersGameUser[] = await prisma.roomChat.findMany({
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
      data: chat
    },
    { status: 200 }
  )
}

export async function POST(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const data = await request.json()

  let message: string = DOMPurify.sanitize(data.message)

  if (message.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid input. XSS attack detected."
      },
      { status: 400 }
    )
  }

  const chatMessage: RoomChat = await prisma.roomChat.create({
    data: {
      roomId: roomId,
      towersUserId: data.towersUserId,
      message
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
