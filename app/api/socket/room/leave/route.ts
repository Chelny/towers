import { NextRequest, NextResponse } from "next/server"
import { Session } from "next-auth"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { isTable } = await request.json()

  try {
    const data = isTable ? { tableId: null } : { roomId: null, tableId: null }

    await prisma.towersGameUser.update({
      where: { userId: session.user.id },
      data
    })

    await updateLastActiveAt(session.user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 500 })
  }
}
