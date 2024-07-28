import { NextResponse } from "next/server"
import { Room } from "@prisma/client"
import { prisma } from "@/lib"

export interface RoomWithCount extends Room {
  _count: {
    towersGameUsers: number
  }
}

export async function GET(): Promise<NextResponse> {
  const roomsWithUserCount: RoomWithCount[] = await prisma.room.findMany({
    include: {
      _count: {
        select: { towersGameUsers: true }
      }
    }
  })

  return NextResponse.json(
    {
      success: true,
      data: roomsWithUserCount
    },
    { status: 200 }
  )
}
