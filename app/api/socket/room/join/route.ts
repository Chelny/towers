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
    // Check if there is an entry with the same towersUserProfileId and roomId
    const joinedRoom: TowersUserRoomTable | null = await prisma.towersUserRoomTable.findFirst({
      where: {
        towersUserProfileId: session.user.towersUserProfileId,
        roomId
      }
    })

    if (!joinedRoom) {
      // User joins room
      await prisma.towersUserRoomTable.create({
        data: {
          towersUserProfileId: session.user.towersUserProfileId,
          roomId,
          tableId
        }
      })
    } else {
      if (joinedRoom.tableId === null) {
        // User joins first table in the room
        await prisma.towersUserRoomTable.update({
          where: { id: joinedRoom.id },
          data: {
            tableId
          }
        })
      } else if (joinedRoom.tableId !== tableId) {
        // User joins another table in the same room
        await prisma.towersUserRoomTable.create({
          data: {
            towersUserProfileId: session.user.towersUserProfileId,
            roomId,
            tableId
          }
        })
      }
    }

    await updateLastActiveAt(session.user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 500 })
  }
}
