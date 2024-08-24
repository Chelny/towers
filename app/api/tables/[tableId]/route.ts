import { NextRequest, NextResponse } from "next/server"
import { Table } from "@prisma/client"
import prisma from "@/lib"

export async function GET(_: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  const { tableId } = context.params
  const table: Table | null = await prisma.table.findUnique({
    where: {
      id: tableId
    },
    include: {
      room: true,
      host: {
        select: {
          user: true
        }
      },
      towersGameUsers: {
        include: {
          user: true
        }
      }
    }
  })

  return NextResponse.json(
    {
      success: true,
      data: {
        tableId,
        tableData: table
      }
    },
    { status: 200 }
  )
}
