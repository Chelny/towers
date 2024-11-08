import { NextRequest, NextResponse } from "next/server"
import { TowersUserRoomTable } from "@prisma/client"
import { getPrismaError, missingRoomIdResponse } from "@/lib/api"
import prisma from "@/lib/prisma"

type Params = Promise<{ roomId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  try {
    const { roomId } = await segmentData.params
    if (!roomId) return missingRoomIdResponse()

    const towersUserRoomTables: TowersUserRoomTable[] = await prisma.towersUserRoomTable.findMany({
      where: { roomId },
      include: {
        userProfile: {
          include: {
            user: true,
          },
        },
        table: true,
      },
      distinct: ["userProfileId"],
      orderBy: {
        table: {
          updatedAt: "desc",
        },
      },
      cacheStrategy: {
        ttl: 30,
        swr: 60,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: towersUserRoomTables,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
