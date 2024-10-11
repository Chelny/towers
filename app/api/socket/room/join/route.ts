import { NextRequest, NextResponse } from "next/server"
import { TowersUserProfile } from "@prisma/client"
import { Session } from "next-auth"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { updateLastActiveAt } from "@/lib/user"

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session: Session | null = await auth()

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { roomId, tableId } = await request.json()

  try {
    if (tableId) {
      // User is in the given room but hasn't joined any table
      const inRoomNotInTable: TowersUserProfile | null = await prisma.towersUserProfile.findFirst({
        where: {
          userId: session.user.id,
          roomId,
          tableId: null
        }
      })

      if (inRoomNotInTable) {
        // Join first table
        await prisma.towersUserProfile.update({
          where: { id: inRoomNotInTable.id },
          data: { tableId }
        })
      } else {
        // User is in the given room and in given table
        const inRoomAndInTable: TowersUserProfile | null = await prisma.towersUserProfile.findFirst({
          where: {
            userId: session.user.id,
            roomId,
            tableId
          }
        })

        if (!inRoomAndInTable) {
          // Join table in given room
          await prisma.towersUserProfile.upsert({
            where: { userId: session.user.id },
            update: { roomId, tableId },
            create: {
              userId: session.user.id,
              roomId,
              tableId
            }
          })
        }
      }
    } else {
      // Join a room
      await prisma.towersUserProfile.upsert({
        where: { userId: session.user.id },
        update: { roomId },
        create: { userId: session.user.id, roomId }
      })
    }

    await updateLastActiveAt(session.user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 500 })
  }
}
