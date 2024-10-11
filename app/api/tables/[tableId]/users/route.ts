import { NextRequest, NextResponse } from "next/server"
import { ITowersUserProfile } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params

  const towersUserProfiles: ITowersUserProfile[] = await prisma.towersUserProfile.findMany({
    where: { tableId },
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
      data: towersUserProfiles
    },
    { status: 200 }
  )
}
