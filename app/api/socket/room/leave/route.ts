import { NextRequest, NextResponse } from "next/server"
import { TowersTable, TowersUserProfile } from "@prisma/client"
import { Session } from "next-auth"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { roomId, tableId } = await request.json()

  try {
    if (!roomId) {
      return NextResponse.json({ success: false, message: "Room ID is required" }, { status: 400 })
    }

    if (tableId) {
      // Get all joined tables from given roomId
      const joinedTables: TowersUserProfile[] = await prisma.towersUserProfile.findMany({
        where: {
          userId: session.user.id,
          roomId
        },
        include: {
          user: true
        }
      })

      const tableIdsToLeave: string[] = joinedTables
        .map((joinedTable: TowersUserProfile) => joinedTable.tableId)
        .filter((tableId: string | null): tableId is string => tableId !== null)

      for (const table of tableIdsToLeave) {
        const otherJoinedTables: TowersUserProfile[] = joinedTables.filter(
          (joinedTable: TowersUserProfile) => joinedTable.tableId !== table
        )

        if (otherJoinedTables.length > 0) {
          // User leaves one of many joined tables
          await prisma.towersUserProfile.updateMany({
            where: { userId: session.user.id, roomId, tableId: table },
            data: { tableId: null }
          })
        } else {
          // User leaves last joined table
          await prisma.towersUserProfile.updateMany({
            where: { userId: session.user.id, roomId },
            data: { tableId: null }
          })
        }

        const remainingUsers: number = await prisma.towersUserProfile.count({
          where: { roomId, tableId: table }
        })

        if (remainingUsers === 0) {
          // No users in the table; delete the table
          await prisma.towersTable.delete({ where: { id: table } })
        } else {
          const isTableHost: TowersTable | null = await prisma.towersTable.findFirst({
            where: { id: table, roomId, hostId: session.user.id }
          })

          if (isTableHost) {
            const nextHost: TowersUserProfile | null = await prisma.towersUserProfile.findFirst({
              where: { userId: { not: session.user.id }, roomId, tableId: table },
              orderBy: { createdAt: "asc" }
            })

            if (nextHost) {
              // Assign the new table  host
              await prisma.towersTable.update({ where: { id: table }, data: { hostId: nextHost.userId } })
            }
          }
        }
      }
    } else {
      // User leaves room
      await prisma.towersUserProfile.updateMany({
        where: { userId: session.user.id, roomId },
        data: { roomId: null }
      })
    }

    await updateLastActiveAt(session.user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 500 })
  }
}
