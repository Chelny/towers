import { NextRequest, NextResponse } from "next/server"
import { TableChat } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { TableChatWithTowersGameUser } from "@/interfaces"
import prisma from "@/lib"
import { removeNullUndefined } from "@/utils"

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json()

  const chatData = {
    tableId: data.tableId,
    message: DOMPurify.sanitize(data.message),
    towersUserId: data.towersUserId,
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

  return NextResponse.json(
    {
      success: true,
      data: chatMessage
    },
    { status: 201 }
  )
}
