import { NextRequest, NextResponse } from "next/server"
import { ITowersTableChatMessage, TowersTableChatMessage, TowersUserProfile } from "@prisma/client"
import DOMPurify from "isomorphic-dompurify"
import { Session } from "next-auth"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
  const searchParams: URLSearchParams = request.nextUrl.searchParams
  const userId: string | null = searchParams.get("userId")
  const session: Session | null = await auth()

  if (!tableId) {
    return NextResponse.json(
      {
        success: false,
        error: "Please provide a table ID to proceed."
      },
      { status: 400 }
    )
  }

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, your request could not be processed."
      },
      { status: 401 }
    )
  }

  const towersUserProfile: { updatedAt: Date } | null = await prisma.towersUserProfile.findFirst({
    where: { userId: session.user.id, tableId },
    select: { updatedAt: true },
    orderBy: { updatedAt: "asc" }
  })

  if (!towersUserProfile) {
    return NextResponse.json(
      {
        success: false,
        message: "The user has not yet joined the table"
      },
      { status: 404 }
    )
  }

  const chatMessages: ITowersTableChatMessage[] = await prisma.towersTableChatMessage.findMany({
    where: {
      tableId,
      AND: [{ privateToUserId: null }, { privateToUserId: userId }],
      updatedAt: { gt: towersUserProfile.updatedAt }
    },
    include: { user: true },
    orderBy: { updatedAt: "asc" },
    take: 100
  })

  return NextResponse.json(
    {
      success: true,
      data: chatMessages
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

  const chatMessage: TowersTableChatMessage = await prisma.towersTableChatMessage.create({
    data: {
      tableId,
      userId: session.user.id,
      message,
      type: data.type
    },
    include: { user: true }
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
