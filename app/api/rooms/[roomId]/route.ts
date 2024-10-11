import { NextRequest, NextResponse } from "next/server"
import { ITowersRoom } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const room: ITowersRoom | null = await prisma.towersRoom.findUnique({ where: { id: roomId } })

  return NextResponse.json(
    {
      success: true,
      data: room
    },
    { status: 200 }
  )
}
