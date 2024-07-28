import { NextRequest, NextResponse } from "next/server"
import { TowersGameUserWithUserAndTables } from "@/interfaces"
import { prisma } from "@/lib"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams: URLSearchParams = request.nextUrl.searchParams
  const roomId: string | null = searchParams.get("roomId")
  const tableId: string | null = searchParams.get("tableId")

  if (!roomId && !tableId) {
    return NextResponse.json(
      {
        success: false,
        error: "roomId or tableId must be provided"
      },
      { status: 400 }
    )
  }

  const whereClause = roomId ? { roomId } : { tableId }

  const towersGameUsers: TowersGameUserWithUserAndTables[] = await prisma.towersGameUser.findMany({
    where: whereClause,
    include: {
      user: true,
      tables: true
    },
    orderBy: {
      updatedAt: "asc"
    }
  })

  let data = {}

  if (roomId) {
    data = {
      roomId,
      roomUsers: towersGameUsers
    }
  } else {
    data = {
      tableId,
      tableUsers: towersGameUsers
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
