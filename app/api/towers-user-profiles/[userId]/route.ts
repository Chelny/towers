import { NextRequest, NextResponse } from "next/server"
import { ITowersUserProfile } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { userId: string } }): Promise<NextResponse> {
  const { userId } = context.params

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, your request could not be processed."
      },
      { status: 401 }
    )
  }

  const towersUserProfile: ITowersUserProfile | null = await prisma.towersUserProfile.findFirst({
    where: { userId },
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
      data: towersUserProfile
    },
    { status: 200 }
  )
}
