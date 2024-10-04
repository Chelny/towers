import { NextRequest, NextResponse } from "next/server"
import { TowersUserRoomTable } from "@prisma/client"
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
      const joinedTables: TowersUserRoomTable[] = await prisma.towersUserRoomTable.findMany({
        where: {
          towersUserProfileId: session.user.towersUserProfileId,
          roomId: roomId
        }
      })

      if (joinedTables.length > 1) {
        // User leaves one of many joined tables
        await prisma.towersUserRoomTable.deleteMany({
          where: {
            towersUserProfileId: session.user.towersUserProfileId,
            roomId: roomId,
            tableId: tableId
          }
        })
      } else {
        // User leaves last table
        await prisma.towersUserRoomTable.updateMany({
          where: {
            towersUserProfileId: session.user.towersUserProfileId,
            roomId: roomId
          },
          data: {
            tableId: null
          }
        })
      }
    } else {
      // User leaves room
      await prisma.towersUserRoomTable.deleteMany({
        where: {
          towersUserProfileId: session.user.towersUserProfileId,
          roomId: roomId
        }
      })
    }

    await updateLastActiveAt(session.user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 500 })
  }
}
