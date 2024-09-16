import { NextRequest, NextResponse } from "next/server"
import { TowersGameUserWithUserAndTables } from "@/interfaces"
import prisma from "@/lib"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
  const towersGameUsers: TowersGameUserWithUserAndTables[] = await prisma.towersGameUser.findMany({
    where: { tableId },
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
