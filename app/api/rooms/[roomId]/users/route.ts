import { NextRequest, NextResponse } from "next/server"
import { TowersUserRoomTable } from "@prisma/client"
import prisma from "@/lib/prisma"
import { badRequestMissingRoomId, getPrismaError } from "@/utils/api"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  try {
    const { roomId } = context.params

    if (!roomId) return badRequestMissingRoomId()

    const towersUserRoomTables: TowersUserRoomTable[] = await prisma.towersUserRoomTable.findMany({
      where: { roomId },
      include: {
        userProfile: {
          include: {
            user: true
          }
        },
        table: true
      },
      distinct: ["userProfileId"],
      orderBy: {
        table: {
          updatedAt: "desc"
        }
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: towersUserRoomTables
      },
      { status: 200 }
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
