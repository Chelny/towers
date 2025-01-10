import { NextRequest, NextResponse } from "next/server"
import { TowersUserProfile } from "@prisma/client"
import { getPrismaError, missingTableIdResponse } from "@/lib/api"
import prisma from "@/lib/prisma"

type Params = Promise<{ tableId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { tableId } = await segmentData.params
  if (!tableId) return missingTableIdResponse()

  try {
    const towersUserProfiles: TowersUserProfile[] = await prisma.towersUserProfile.findMany({
      where: {
        userTables: {
          some: {
            tableId,
          },
        },
      },
      include: {
        user: {
          select: {
            username: true,
            lastActiveAt: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: towersUserProfiles,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
