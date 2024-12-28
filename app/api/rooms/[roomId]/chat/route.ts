import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { t } from "@lingui/core/macro"
import { TowersRoomChatMessage, TowersUserProfile } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { updateUserLastActiveAt } from "@/data/user"
import { getPrismaError, missingRoomIdResponse, unauthorized } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

type Params = Promise<{ roomId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { roomId } = await segmentData.params
  if (!roomId) return missingRoomIdResponse()

  const session: Session | null = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  try {
    const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!towersUserProfile) {
      return NextResponse.json(
        {
          success: false,
          message: t({ message: "The user profile was not found" }),
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
          message: t({ message: "The user has not yet joined the room" }),
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

  const session: Session | null = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  try {
    const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!towersUserProfile) {
      return NextResponse.json(
        {
          success: false,
          message: t({ message: "Unable to find the requested user profile." }),
        },
        { status: 404 },
      )
    }

    let message: string = DOMPurify.sanitize(body.message)

    if (message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: t({ message: "Invalid input. XSS attack detected." }),
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

    await updateUserLastActiveAt(session.user.id)

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
