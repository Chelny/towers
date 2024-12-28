import { NextRequest, NextResponse } from "next/server"
import { t } from "@lingui/core/macro"
import { TowersTable, TowersUserProfile } from "@prisma/client"
import { getPrismaError } from "@/lib/api"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { roomId, userId, tableType, rated } = await request.json()

  try {
    let towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: {
        userId,
      },
    })

    if (!towersUserProfile) {
      return NextResponse.json(
        {
          success: false,
          message: t({ message: "The user profile was not found" }),
        },
        { status: 404 },
      )
    }

    // Retrieve all table numbers in the room
    const roomTables: { tableNumber: number }[] = await prisma.towersTable.findMany({
      where: {
        roomId,
      },
      select: {
        tableNumber: true,
      },
      orderBy: {
        tableNumber: "asc",
      },
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

    const table: TowersTable = await prisma.towersTable.create({
      data: {
        roomId,
        tableNumber: availableTableNumber,
        hostId: towersUserProfile.id,
        tableType,
        rated,
      },
      include: {
        host: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: table,
      },
      { status: 201 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
