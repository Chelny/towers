import { NextResponse } from "next/server"
import { RoomWithCount } from "@/interfaces/room"
import prisma from "@/lib/prisma"

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
