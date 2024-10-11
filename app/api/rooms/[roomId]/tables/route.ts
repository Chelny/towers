import { NextRequest, NextResponse } from "next/server"
import { ITowersTable } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params

  const tables: ITowersTable[] = await prisma.towersTable.findMany({
    where: { roomId },
    include: {
      host: true,
      userProfiles: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      tableNumber: "asc"
    }
  })

  return NextResponse.json(
    {
      success: true,
      data: tables
    },
    { status: 200 }
  )
}
