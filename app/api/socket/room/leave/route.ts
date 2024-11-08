import { NextRequest, NextResponse } from "next/server"
import { TowersTable, TowersUserProfile, TowersUserRoomTable } from "@prisma/client"
import { Session } from "next-auth"
import { auth } from "@/auth"
import { getPrismaError, unauthorized } from "@/lib/api"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session: Session | null = await auth()
  if (!session) return unauthorized()

  try {
    const { roomId, tableId } = await request.json()

    if (!roomId) {
      return NextResponse.json({ success: false, message: "Room ID is required" }, { status: 400 })
    }

    const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!towersUserProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "The user profile was not found",
        },
        { status: 404 },
      )
    }

    if (tableId) {
      // Get all joined tables from given roomId
      const joinedTables: TowersUserRoomTable[] = await prisma.towersUserRoomTable.findMany({
        where: {
          userProfileId: towersUserProfile.id,
          roomId,
        },
      })

      const tableIdsToLeave: string[] = joinedTables
        .map((joinedTable: TowersUserRoomTable) => joinedTable.tableId)
        .filter((tableId: string | null): tableId is string => tableId !== null)

      for (const table of tableIdsToLeave) {
        const otherJoinedTables: TowersUserRoomTable[] = joinedTables.filter(
          (joinedTable: TowersUserRoomTable) => joinedTable.tableId !== table,
        )

        if (otherJoinedTables.length > 0) {
          // User leaves one of many joined tables
          await prisma.towersUserRoomTable.updateMany({
            where: { userProfileId: towersUserProfile.id, roomId, tableId: table },
            data: { tableId: null },
          })
        } else {
          // User leaves last joined table
          await prisma.towersUserRoomTable.updateMany({
            where: { userProfileId: towersUserProfile.id, roomId },
            data: { tableId: null },
          })
        }

        const remainingUsers: number = await prisma.towersUserRoomTable.count({
          where: { roomId, tableId: table },
        })

        if (remainingUsers === 0) {
          // No users in the table delete the table
          await prisma.towersTable.delete({
            where: { id: table },
          })
        } else {
          const isTableHost: TowersTable | null = await prisma.towersTable.findFirst({
            where: { id: table, roomId, hostId: towersUserProfile.id },
          })

          if (isTableHost) {
            const nextUserRoomTable: TowersUserRoomTable | null = await prisma.towersUserRoomTable.findFirst({
              where: { userProfileId: { not: towersUserProfile.id }, roomId, tableId: table },
              orderBy: { createdAt: "asc" },
            })

            if (nextUserRoomTable) {
              const nextHost: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
                where: { id: nextUserRoomTable.userProfileId },
              })

              if (nextHost) {
                // Assign the new table host
                await prisma.towersTable.update({
                  where: { id: table },
                  data: { hostId: nextHost.id },
                })
              }
            }
          }
        }
      }
    } else {
      // Get all joined tables by user
      const joinedTableIds: { tableId: string | null }[] = await prisma.towersUserRoomTable.findMany({
        where: { userProfileId: towersUserProfile.id, roomId },
        select: { tableId: true },
      })

      // User leaves room
      await prisma.towersUserRoomTable.deleteMany({
        where: { userProfileId: towersUserProfile.id, roomId },
      })

      for (const { tableId } of joinedTableIds) {
        const remainingUsersInTable = await prisma.towersUserRoomTable.count({
          where: { tableId },
        })

        // If no users are left in the table, delete the table
        if (tableId && remainingUsersInTable === 0) {
          await prisma.towersTable.delete({
            where: { id: tableId },
          })
        }
      }
    }

    await updateLastActiveAt(session.user.id)

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
