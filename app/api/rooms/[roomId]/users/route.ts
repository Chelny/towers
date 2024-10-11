import { NextRequest, NextResponse } from "next/server"
import { ITowersUserProfile } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params

  const userProfiles: ITowersUserProfile[] = await prisma.towersUserProfile.findMany({
    where: { roomId },
    include: {
      user: true,
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
      data: userProfiles
    },
    { status: 200 }
  )
}
