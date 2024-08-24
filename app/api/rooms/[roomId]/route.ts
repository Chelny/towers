import { NextRequest, NextResponse } from "next/server"
import { RoomWithTables } from "@/interfaces"
import prisma from "@/lib"

export async function GET(_: NextRequest, context: { params: { roomId: string } }): Promise<NextResponse> {
  const { roomId } = context.params
  const room: RoomWithTables | null = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      tables: {
        include: {
          host: {
            include: {
              user: true
            }
          },
          towersGameUsers: {
            include: {
              user: true
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
        roomId,
        roomData: {
          room,
          tablesCount
        }
      }
    },
    { status: 200 }
  )
}
