"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import { TableType } from "@prisma/client"
import { useSelector } from "react-redux"
import Button from "@/components/ui/Button"
import { RoomWithTablesCount, TableWithHostAndTowersGameUsers, TowersGameUserWithUser } from "@/interfaces"
import { RootState } from "@/redux/store"

type RoomTableProps = {
  roomId: string
}

export default function RoomTable({ roomId }: RoomTableProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const roomInfo: RoomWithTablesCount | null = useSelector((state: RootState) => state.socket.rooms[roomId]?.roomInfo)
  const isRoomInfoLoading: boolean = useSelector((state: RootState) => state.socket.rooms[roomId]?.isRoomInfoLoading)
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8]
  ]

  return (
    <>
      {roomInfo?.room?.tables?.map((table: TableWithHostAndTowersGameUsers) => (
        <div key={table.id} className="flex flex-col">
          <div className="flex items-center border-b-2 border-b-gray-300">
            <div className="basis-20 row-span-2 flex justify-center items-center h-full px-2 border-gray-300">
              #{table.tableNumber}
            </div>
            <div className="flex-1 flex flex-col gap-1 h-full px-2 border-l border-gray-300 divide-y divide-gray-200">
              <div className="flex flex-1 gap-1 pt-3 pb-2">
                <div className="basis-32 border-gray-300">
                  <Button
                    className="w-full h-full"
                    disabled={isRoomInfoLoading || table.tableType === TableType.PRIVATE}
                    onClick={() => router.push(`?room=${roomId}&table=${table.id}`)}
                  >
                    Watch
                  </Button>
                </div>
                <div className="flex flex-col gap-1 border-gray-300">
                  {seatMapping.map((row: number[], rowIndex: number) => (
                    <div key={rowIndex} className="flex flex-row gap-1">
                      {row.map((seatNumber: number, colIndex: number) => {
                        const user: TowersGameUserWithUser | undefined = table.towersGameUsers.find(
                          (user: TowersGameUserWithUser) => user.seatNumber === seatNumber
                        )
                        return user ? (
                          <div
                            key={colIndex}
                            className="flex items-center justify-center w-36 p-1 border border-gray-300 rounded"
                          >
                            <span className="truncate">{user.user.username}</span>
                          </div>
                        ) : (
                          <Button
                            key={colIndex}
                            className="w-36"
                            disabled={
                              isRoomInfoLoading ||
                              table.tableType === TableType.PROTECTED ||
                              table.tableType === TableType.PRIVATE
                            }
                            onClick={() => router.push(`?room=${roomId}&table=${table.id}`)}
                          >
                            Join
                          </Button>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex-1 px-2 line-clamp-3">
                  {/* List non-seated players by username, separated by commas */}
                  {table.towersGameUsers
                    .filter((towersGameUser: TowersGameUserWithUser) => !towersGameUser.seatNumber)
                    .map((towersGameUser: TowersGameUserWithUser) => towersGameUser.user.username)
                    .join(", ")}
                </div>
              </div>
              <div className="flex py-1 text-sm">
                {table.rated && <span>Option: rated&nbsp;-&nbsp;</span>}
                <span>Host: {table.host?.user.username}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
