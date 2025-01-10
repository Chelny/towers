import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { t } from "@lingui/core/macro"
import { TableChatMessageType, TowersTableChatMessage, TowersUserProfile } from "@prisma/client"
import { getPrismaError, missingTableIdResponse, unauthorized } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

type Params = Promise<{ tableId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
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
          message: t({ message: "The user profile was not found" }),
        },
        { status: 404 },
      )
    }

    const towersUserTable: { updatedAt: Date } | null = await prisma.towersUserTable.findFirst({
      where: { userProfileId: towersUserProfile.id, tableId },
      select: { updatedAt: true },
      orderBy: { updatedAt: "asc" },
    })

    if (!towersUserTable) {
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
        OR: [
          {
            // Messages visible to everyone
            type: {
              notIn: [
                TableChatMessageType.CIPHER_KEY,
                TableChatMessageType.HERO_CODE,
                TableChatMessageType.TABLE_HOST,
                TableChatMessageType.TABLE_TYPE,
              ],
            },
          },
          {
            // Restricted messages, visible only to the logged-in user
            type: {
              in: [
                TableChatMessageType.CIPHER_KEY,
                TableChatMessageType.HERO_CODE,
                TableChatMessageType.TABLE_HOST,
                TableChatMessageType.TABLE_TYPE,
              ],
            },
            userProfileId: session.userProfileIds.towers,
          },
        ],
        updatedAt: { gt: towersUserProfile.updatedAt },
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
