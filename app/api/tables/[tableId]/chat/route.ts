import { NextRequest, NextResponse } from "next/server"
import { TableChat, TableMessage, TowersUserProfile } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { Session } from "next-auth"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
  const searchParams: URLSearchParams = request.nextUrl.searchParams
  const towersUserProfileId: string | null = searchParams.get("towersUserProfileId")

  if (!tableId) {
    return NextResponse.json(
      {
        success: false,
        error: "Please provide a table ID to proceed."
      },
      { status: 400 }
    )
  }

  const chat: TableMessage[] = await prisma.tableChat.findMany({
    where: {
      tableId: tableId,
      OR: [{ visibleToTowersUserId: null }, { visibleToTowersUserId: towersUserProfileId }],
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      }
    },
    include: {
      towersUserProfile: {
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

export async function POST(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
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

  const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
    where: { id: session.user.towersUserProfileId }
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

  const chatData = {
    tableId,
    towersUserProfileId: session.user.towersUserProfileId,
    message,
    type: data.type
  }

  const chatMessage: TableChat = await prisma.tableChat.create({
    data: chatData,
    include: {
      towersUserProfile: {
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
