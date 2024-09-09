import { NextResponse } from "next/server"
import { Room } from "@prisma/client"
import { RoomWithCount } from "@/interfaces"
import prisma from "@/lib"

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
