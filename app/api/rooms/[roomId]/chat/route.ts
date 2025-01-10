import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { t } from "@lingui/core/macro"
import { TowersRoomChatMessage, TowersUserProfile } from "@prisma/client"
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

    const towersUserRoom: { updatedAt: Date } | null = await prisma.towersUserRoom.findFirst({
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

    if (!towersUserRoom) {
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
          select: {
            user: {
              select: {
                username: true,
              },
            },
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
