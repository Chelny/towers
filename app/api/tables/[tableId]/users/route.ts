import { NextRequest, NextResponse } from "next/server"
import { TowersUserRoomTable } from "@prisma/client"
import { getPrismaError, missingTableIdResponse } from "@/lib/api"
import prisma from "@/lib/prisma"

type Params = Promise<{ tableId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { tableId } = await segmentData.params
  if (!tableId) return missingTableIdResponse()

  try {
    const towersUserRoomTables: TowersUserRoomTable[] = await prisma.towersUserRoomTable.findMany({
      where: { tableId },
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
        updatedAt: "desc",
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
