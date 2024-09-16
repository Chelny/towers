import { NextRequest, NextResponse } from "next/server"
import { Session } from "next-auth"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { room, isTable } = await request.json()

  try {
    const data = isTable ? { tableId: null } : { roomId: null, tableId: null }

    await prisma.towersGameUser.update({
      where: { userId: session.user.id },
      data
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
