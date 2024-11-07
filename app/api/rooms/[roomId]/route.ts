import { NextRequest, NextResponse } from "next/server"
import { TowersRoom } from "@prisma/client"
import prisma from "@/lib/prisma"
import { badRequestMissingRoomId, getPrismaError } from "@/utils/api"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  try {
    const { roomId } = context.params

    if (!roomId) return badRequestMissingRoomId()

    const room: TowersRoom | null = await prisma.towersRoom.findUnique({
      where: {
        id: roomId
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: room
      },
      { status: 200 }
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
