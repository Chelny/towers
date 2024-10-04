import { NextRequest, NextResponse } from "next/server"
import { TowersUser } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
  const towersUsers: TowersUser[] = await prisma.towersUserRoomTable.findMany({
    where: { tableId },
    include: {
      towersUserProfile: {
        include: {
          user: true,
          towersUserRoomTables: true
        }
      },
      room: true,
      table: true
    },
    orderBy: {
      updatedAt: "asc"
    }
  })

  return NextResponse.json(
    {
      success: true,
      data: towersUsers
    },
    { status: 200 }
  )
}
