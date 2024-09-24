import { NextRequest, NextResponse } from "next/server"
import { RoomChat } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { Session } from "next-auth"
import { RoomChatWithTowersGameUser } from "@/interfaces/room-chat"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

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
  const session: Session | null = data.session

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Please sign in to access your account."
      },
      { status: 401 }
    )
  }

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

  await updateLastActiveAt(session.user.id)

  return NextResponse.json(
    {
      success: true,
      data: chatMessage
    },
    { status: 201 }
  )
}
