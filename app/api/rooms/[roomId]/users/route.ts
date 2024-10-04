import { NextRequest, NextResponse } from "next/server"
import { TowersUser } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const towersUsers: TowersUser[] = await prisma.towersUserRoomTable.findMany({
    where: { roomId },
    include: {
      towersUserProfile: {
        include: {
          user: true
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
