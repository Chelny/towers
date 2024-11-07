import { NextRequest, NextResponse } from "next/server"
import { TowersUserRoomTable } from "@prisma/client"
import prisma from "@/lib/prisma"
import { badRequestMissingTableId, getPrismaError } from "@/utils/api"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  try {
    const { tableId } = context.params

    if (!tableId) return badRequestMissingTableId()

    const towersUserRoomTables: TowersUserRoomTable[] = await prisma.towersUserRoomTable.findMany({
      where: { tableId },
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
        updatedAt: "desc"
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
