import { NextRequest, NextResponse } from "next/server"
import { TableChat } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { Session } from "next-auth"
import { TableChatWithTowersGameUser } from "@/interfaces/table-chat"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"
import { removeNullUndefined } from "@/utils/object-utils"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
  const searchParams: URLSearchParams = request.nextUrl.searchParams
  const towersUserId: string | null = searchParams.get("towersUserId")

  if (!tableId) {
    return NextResponse.json(
      {
        success: false,
        error: "Please provide a table ID to proceed."
      },
      { status: 400 }
    )
  }

  const chat: TableChatWithTowersGameUser[] = await prisma.tableChat.findMany({
    where: {
      tableId: tableId,
      OR: [{ visibleToTowersUserId: null }, { visibleToTowersUserId: towersUserId }],
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
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
    tableId: tableId,
    towersUserId: data.towersUserId,
    message,
    type: data.type
  }

  const chatMessage: TableChat = await prisma.tableChat.create({
    data: removeNullUndefined(chatData),
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
