import { NextRequest, NextResponse } from "next/server"
import { TowersUserProfile } from "@prisma/client"
import { getPrismaError, missingRoomIdResponse } from "@/lib/api"
import prisma from "@/lib/prisma"

type Params = Promise<{ roomId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { roomId } = await segmentData.params
  if (!roomId) return missingRoomIdResponse()

  try {
    const towersUserProfiles: TowersUserProfile[] = await prisma.towersUserProfile.findMany({
      where: {
        userRooms: {
          some: {
            roomId,
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
        userTables: {
          select: {
            seatNumber: true,
            table: {
              select: {
                tableNumber: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
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
