import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { t } from "@lingui/core/macro"
import { TowersTableChatMessage, TowersUserProfile } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { updateUserLastActiveAt } from "@/data/user"
import { getPrismaError, missingTableIdResponse, unauthorized } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

type Params = Promise<{ tableId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { tableId } = await segmentData.params
  if (!tableId) return missingTableIdResponse()

  const searchParams: URLSearchParams = request.nextUrl.searchParams
  const userId: string | null = searchParams.get("userId")

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
      where: { userProfileId: towersUserProfile.id, tableId },
      select: { updatedAt: true },
      orderBy: { updatedAt: "asc" },
    })

    if (!towersUserRoomTable) {
      return NextResponse.json(
        {
          success: false,
          message: t({ message: "The user has not yet joined the table" }),
        },
        { status: 404 },
      )
    }

    const chatMessages: TowersTableChatMessage[] = await prisma.towersTableChatMessage.findMany({
      where: {
        tableId,
        AND: [{ privateToUserId: null }, { privateToUserId: userId }],
        updatedAt: { gt: towersUserProfile.updatedAt },
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

  const { tableId } = await segmentData.params
  if (!tableId) return missingTableIdResponse()

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

    const chatMessage: TowersTableChatMessage = await prisma.towersTableChatMessage.create({
      data: {
        tableId,
        userProfileId: towersUserProfile.id,
        message,
        type: body.type,
        privateToUserId: body.privateToUserId,
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
