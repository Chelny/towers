import { NextRequest, NextResponse } from "next/server"
import { TowersRoom } from "@prisma/client"
import { getPrismaError, missingRoomIdResponse } from "@/lib/api"
import prisma from "@/lib/prisma"

type Params = Promise<{ roomId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { roomId } = await segmentData.params
  if (!roomId) return missingRoomIdResponse()

  try {
    const room: TowersRoom | null = await prisma.towersRoom.findUnique({
      where: {
        id: roomId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: room,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
