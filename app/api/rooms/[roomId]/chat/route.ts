import { NextRequest, NextResponse } from "next/server"
import { TowersRoomChatMessage, TowersUserProfile } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { Session } from "next-auth"
import { auth } from "@/auth"
import { getPrismaError, missingRoomIdResponse, unauthorized } from "@/lib/api"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

type Params = Promise<{ roomId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { roomId } = await segmentData.params
  if (!roomId) return missingRoomIdResponse()

  const session: Session | null = await auth()
  if (!session) return unauthorized()

  try {
    const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!towersUserProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "The user profile was not found",
        },
        { status: 404 },
      )
    }

    const towersUserRoomTable: { updatedAt: Date } | null = await prisma.towersUserRoomTable.findFirst({
      where: {
        userProfileId: towersUserProfile.id,
        roomId,
      },
      select: {
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "asc",
      },
    })

    if (!towersUserRoomTable) {
      return NextResponse.json(
        {
          success: false,
          message: "The user has not yet joined the room",
        },
        { status: 404 },
      )
    }

    const chatMessages: TowersRoomChatMessage[] = await prisma.towersRoomChatMessage.findMany({
      where: {
        roomId,
        updatedAt: {
          gt: towersUserProfile.updatedAt,
        },
      },
      include: {
        userProfile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
      take: 50,
      cacheStrategy: {
        ttl: 5,
        swr: 20,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: chatMessages,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}

export async function POST(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const body = await request.json()

  const { roomId } = await segmentData.params
  if (!roomId) return missingRoomIdResponse()

  const session: Session | null = body.session
  if (!session) return unauthorized()

  try {
    const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!towersUserProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to find the requested user profile.",
        },
        { status: 404 },
      )
    }

    let message: string = DOMPurify.sanitize(body.message)

    if (message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input. XSS attack detected.",
        },
        { status: 400 },
      )
    }

    const chatMessage: TowersRoomChatMessage = await prisma.towersRoomChatMessage.create({
      data: {
        roomId,
        userProfileId: towersUserProfile.id,
        message,
      },
      include: {
        userProfile: {
          include: {
            user: true,
          },
        },
      },
    })

    await updateLastActiveAt(session.user.id)

    return NextResponse.json(
      {
        success: true,
        data: chatMessage,
      },
      { status: 201 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
