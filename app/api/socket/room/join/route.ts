import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { TowersUserProfile, TowersUserRoomTable } from "@prisma/client"
import { updateUserLastActiveAt } from "@/data/user"
import { getPrismaError, unauthorized } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const { roomId, tableId } = await request.json()

  const session: Session | null = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  try {
    let towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!towersUserProfile) {
      towersUserProfile = await prisma.towersUserProfile.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    let towersUserRoomTable: TowersUserRoomTable | null = null

    if (tableId) {
      // User is in the given room but hasn't joined any table
      const inRoomNotInTable: TowersUserRoomTable | null = await prisma.towersUserRoomTable.findFirst({
        where: {
          userProfileId: towersUserProfile.id,
          roomId,
          tableId: null,
        },
      })

      if (inRoomNotInTable) {
        // Join first table
        towersUserRoomTable = await prisma.towersUserRoomTable.update({
          where: { id: inRoomNotInTable.id },
          data: { tableId },
          include: {
            userProfile: {
              include: {
                user: true,
              },
            },
            table: true,
          },
        })
      } else {
        // User is in the given room and in the given table
        const inRoomAndInTable: TowersUserRoomTable | null = await prisma.towersUserRoomTable.findFirst({
          where: {
            userProfileId: towersUserProfile.id,
            roomId,
            tableId,
          },
        })

        if (!inRoomAndInTable) {
          // Join table in given room
          towersUserRoomTable = await prisma.towersUserRoomTable.create({
            data: {
              userProfile: {
                connect: { id: towersUserProfile.id },
              },
              roomId,
              tableId,
            },
            include: {
              userProfile: {
                include: {
                  user: true,
                },
              },
              table: true,
            },
          })
        }
      }
    } else {
      // Join a room
      const joinedRoom: TowersUserRoomTable | null = await prisma.towersUserRoomTable.findFirst({
        where: {
          userProfileId: towersUserProfile.id,
          roomId,
          tableId: tableId ?? null,
        },
      })

      if (joinedRoom) {
        towersUserRoomTable = await prisma.towersUserRoomTable.update({
          where: { id: joinedRoom.id },
          data: {
            roomId,
            tableId: tableId ?? null,
          },
          include: {
            userProfile: {
              include: {
                user: true,
              },
            },
            table: true,
          },
        })
      } else {
        towersUserRoomTable = await prisma.towersUserRoomTable.create({
          data: {
            userProfileId: towersUserProfile.id,
            roomId,
            tableId: tableId ?? null,
          },
          include: {
            userProfile: {
              include: {
                user: true,
              },
            },
            table: true,
          },
        })
      }
    }

    await updateUserLastActiveAt(session.user.id)

    return NextResponse.json(
      {
        success: true,
        data: towersUserRoomTable,
      },
      { status: 200 },
    )
  } catch (error) {
    return getPrismaError(error)
  }
}
