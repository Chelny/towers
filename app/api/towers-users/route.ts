import { NextRequest, NextResponse } from "next/server"
import { TowersUser } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams: URLSearchParams = request.nextUrl.searchParams
  const roomId: string | null = searchParams.get("roomId")
  const tableId: string | null = searchParams.get("tableId")

  if (!roomId && !tableId) {
    return NextResponse.json(
      {
        success: false,
        error: "Please provide either a room ID or a table ID to proceed."
      },
      { status: 400 }
    )
  }

  const whereClause = roomId ? { roomId } : { tableId }

  const towersUsers: TowersUser[] = await prisma.towersUserRoomTable.findMany({
    where: whereClause,
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

  let data = {}

  if (roomId) {
    data = {
      roomId,
      roomUsers: towersUsers
    }
  } else {
    data = {
      tableId,
      tableUsers: towersUsers
    }
  }

  return NextResponse.json(
    {
      success: true,
      data
    },
    { status: 200 }
  )
}
