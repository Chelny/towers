import { NextRequest, NextResponse } from "next/server"
import { TowersTable } from "@prisma/client"
import { Session } from "next-auth"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { badRequestMissingTableId, getPrismaError, unauthorized } from "@/utils/api"

export async function GET(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  try {
    const { tableId } = context.params

    if (!tableId) return badRequestMissingTableId()

    const table: TowersTable | null = await prisma.towersTable.findUnique({
      where: {
        id: tableId
      },
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
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: table
      },
      { status: 200 }
    )
  } catch (error) {
    return getPrismaError(error)
  }
}

export async function PATCH(request: NextRequest, context: { params: { tableId: string } }): Promise<NextResponse> {
  try {
    const session: Session | null = await auth()

    if (!session) return unauthorized()

    const { tableType, rated } = await request.json()

    const table: TowersTable = await prisma.towersTable.update({
      where: { id: context.params.tableId },
      data: { tableType, rated }
    })

    return NextResponse.json(
      {
        success: true,
        data: table
      },
      { status: 200 }
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
