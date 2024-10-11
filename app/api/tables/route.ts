import { NextRequest, NextResponse } from "next/server"
import { ITowersTable } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json()
  const { roomId, hostId, tableType, rated } = data

  // Retrieve all table numbers in the room
  const roomTables: { tableNumber: number }[] = await prisma.towersTable.findMany({
    where: { roomId },
    select: { tableNumber: true },
    orderBy: { tableNumber: "asc" }
  })

  // Find the lowest available table number
  let availableTableNumber: number = 1

  for (const { tableNumber } of roomTables) {
    if (tableNumber === availableTableNumber) {
      availableTableNumber++
    } else {
      break
    }
  }

  const table: ITowersTable = await prisma.towersTable.create({
    data: {
      roomId,
      tableNumber: availableTableNumber,
      hostId,
      tableType,
      rated
    },
    include: {
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
    { status: 201 }
  )
}
