import { NextRequest, NextResponse } from "next/server"
import { TowersRoomChatMessage, TowersUserProfile } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { Session } from "next-auth"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"
import { badRequestMissingRoomId, getPrismaError, unauthorized } from "@/utils/api"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  try {
    const { roomId } = context.params
    const session: Session | null = await auth()

    if (!roomId) return badRequestMissingRoomId()

    if (!session) return unauthorized()

    const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!towersUserProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "The user profile was not found"
        },
        { status: 404 }
      )
    }

    const towersUserRoomTable: { updatedAt: Date } | null = await prisma.towersUserRoomTable.findFirst({
      where: {
        userProfileId: towersUserProfile.id,
        roomId
      },
      select: {
        updatedAt: true
      },
      orderBy: {
        updatedAt: "asc"
      }
    })

    if (!towersUserRoomTable) {
      return NextResponse.json(
        {
          success: false,
          message: "The user has not yet joined the room"
        },
        { status: 404 }
      )
    }

    const chatMessages: TowersRoomChatMessage[] = await prisma.towersRoomChatMessage.findMany({
      where: {
        roomId,
        updatedAt: {
          gt: towersUserProfile.updatedAt
        }
      },
      include: {
        userProfile: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        updatedAt: "asc"
      },
      take: 100
    })

    return NextResponse.json(
      {
        success: true,
        data: chatMessages
      },
      { status: 200 }
    )
  } catch (error) {
    return getPrismaError(error)
  }
}

export async function POST(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  try {
    const { roomId } = context.params
    const data = await request.json()
    const session: Session | null = data.session

    if (!roomId) return badRequestMissingRoomId()

    if (!session) return unauthorized()

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
        userProfileId: towersUserProfile.id,
        message
      },
      include: {
        userProfile: {
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
  } catch (error) {
    return getPrismaError(error)
  }
}
