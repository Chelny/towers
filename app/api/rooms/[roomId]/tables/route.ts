import { NextRequest, NextResponse } from "next/server"
import { TowersTable } from "@prisma/client"
import prisma from "@/lib/prisma"
import { badRequestMissingRoomId, getPrismaError } from "@/utils/api"

export async function GET(request: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  try {
    const { roomId } = context.params

    if (!roomId) return badRequestMissingRoomId()

    const tables: TowersTable[] = await prisma.towersTable.findMany({
      where: { roomId },
      include: {
        host: {
          include: {
            user: true
          }
        },
        userRoomTables: {
          include: {
            userProfile: {
              include: {
                user: true
              }
            }
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
  } catch (error) {
    return getPrismaError(error)
  }
}
