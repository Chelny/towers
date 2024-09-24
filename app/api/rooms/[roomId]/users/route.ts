import { NextRequest, NextResponse } from "next/server"
import { TowersGameUserWithUserAndTables } from "@/interfaces/towers-game-user"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const towersGameUsers: TowersGameUserWithUserAndTables[] = await prisma.towersGameUser.findMany({
    where: { roomId },
    include: {
      user: true,
      table: true
    },
    orderBy: {
      updatedAt: "asc"
    }
  })

  return NextResponse.json(
    {
      success: true,
      data: towersGameUsers
    },
    { status: 200 }
  )
}
