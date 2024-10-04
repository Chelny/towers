import { NextRequest, NextResponse } from "next/server"
import { Room, RoomInfo } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const room: RoomInfo | null = await prisma.room.findUnique({
    where: {
      id: roomId
    },
    include: {
      tables: {
        include: {
          host: {
            include: {
              user: true
            }
          },
          towersUserRoomTables: {
            include: {
              towersUserProfile: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  })
  const tablesCount: number = await prisma.table.count({ where: { roomId } })

  return NextResponse.json(
    {
      success: true,
      data: {
        room,
        tablesCount
      }
    },
    { status: 200 }
  )
}
