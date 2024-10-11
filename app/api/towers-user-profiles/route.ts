import { NextRequest, NextResponse } from "next/server"
import { ITowersUserProfile } from "@prisma/client"
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

  const towersUserProfiles: ITowersUserProfile[] = await prisma.towersUserProfile.findMany({
    where: whereClause,
    include: {
      user: true,
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
      roomUsers: towersUserProfiles
    }
  } else {
    data = {
      tableId,
      tableUsers: towersUserProfiles
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
