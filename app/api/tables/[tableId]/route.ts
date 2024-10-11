import { NextRequest, NextResponse } from "next/server"
import { ITowersTable } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params

  const table: ITowersTable | null = await prisma.towersTable.findUnique({
    where: {
      id: tableId
    },
    include: {
      room: true,
      host: true,
      userProfiles: {
        include: {
          user: true
        }
      }
    }
  })

  return NextResponse.json(
    {
      success: true,
      data: table
    },
    { status: 200 }
  )
}
