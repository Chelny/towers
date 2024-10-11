import { NextRequest, NextResponse } from "next/server"
import { TowersRoomChatMessage, TowersUserProfile } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { Session } from "next-auth"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params

  const chat: TowersRoomChatMessage[] = await prisma.towersRoomChatMessage.findMany({
    where: {
      roomId: roomId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      }
    },
    include: {
      user: true
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
        message: "Sorry, your request could not be processed."
      },
      { status: 401 }
    )
  }

  const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!towersUserProfile) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to find the requested user profile."
      },
      { status: 404 }
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

  const chatMessage: TowersRoomChatMessage = await prisma.towersRoomChatMessage.create({
    data: {
      roomId,
      userId: session.user.id,
      message
    },
    include: {
      user: true
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
