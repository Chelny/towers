import { NextRequest, NextResponse } from "next/server"
import { TableInfo } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
  const table: TableInfo | null = await prisma.table.findUnique({
    where: {
      id: tableId
    },
    include: {
      room: true,
      host: {
        include: {
          user: true
        }
      },
      towersUserRoomTables: {
        include: {
          towersUserProfile: {
            include: {
              user: true
            }
          }
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
