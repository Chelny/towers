import { NextRequest, NextResponse } from "next/server"
import { TowersTable } from "@prisma/client"
import { getPrismaError, missingRoomIdResponse } from "@/lib/api"
import prisma from "@/lib/prisma"

type Params = Promise<{ roomId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { roomId } = await segmentData.params
  if (!roomId) return missingRoomIdResponse()

  try {
    const tables: TowersTable[] = await prisma.towersTable.findMany({
      where: { roomId },
      include: {
        host: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        userTables: {
          select: {
            userProfile: {
              include: {
                user: {
                  select: {
                    username: true,
                  },
                },
                userTables: {
                  select: {
                    seatNumber: true,
                  },
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        tableNumber: "asc",
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: tables,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
