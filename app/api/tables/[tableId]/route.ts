import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { TowersTable } from "@prisma/client"
import { getPrismaError, missingTableIdResponse, unauthorized } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

type Params = Promise<{ tableId: string }>

export async function GET(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { tableId } = await segmentData.params
  if (!tableId) return missingTableIdResponse()

  try {
    const table: TowersTable | null = await prisma.towersTable.findUnique({
      where: {
        id: tableId,
      },
      include: {
        host: {
          include: {
            user: true,
          },
        },
        userRoomTables: {
          include: {
            userProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      cacheStrategy: {
        ttl: 30,
        swr: 60,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: table,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}

export async function PATCH(request: NextRequest, segmentData: { params: Params }): Promise<NextResponse> {
  const { tableType, rated } = await request.json()

  const { tableId } = await segmentData.params
  if (!tableId) return missingTableIdResponse()

  const session: Session | null = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  try {
    const table: TowersTable = await prisma.towersTable.update({
      where: { id: tableId },
      data: { tableType, rated },
    })

    return NextResponse.json(
      {
        success: true,
        data: table,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
