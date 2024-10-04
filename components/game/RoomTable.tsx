"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import {
  RoomInfoWithTablesCount,
  TableInfo,
  TableType,
  TowersUser,
  TowersUserProfileWithRelations,
  TowersUserRoomTable,
  TowersUserRoomTableWithRelations
} from "@prisma/client"
import Button from "@/components/ui/Button"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { AppDispatch, RootState } from "@/redux/store"
import { joinRoom } from "@/redux/thunks/socket-thunks"

type RoomTableProps = {
  roomId: string
}

export default function RoomTable({ roomId }: RoomTableProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { data: session } = useSessionData()
  const dispatch: AppDispatch = useAppDispatch()
  const roomInfo: RoomInfoWithTablesCount | null = useAppSelector(
    (state: RootState) => state.socket.rooms[roomId]?.roomInfo
  )
  const isRoomInfoLoading: boolean = useAppSelector((state: RootState) => state.socket.rooms[roomId]?.isRoomInfoLoading)
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8]
  ]

  const handleJoinTable = (roomId: string, tableId: string): void => {
    dispatch(joinRoom({ roomId, tableId, username: session?.user.username }))
      .unwrap()
      .then(() => {
        router.push(`?room=${roomId}&table=${tableId}`)
      })
      .catch((error) => {
        console.error("Error joining table:", error)
      })
  }

  return (
    <>
      {roomInfo?.room?.tables?.map((table: TableInfo) => (
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
                    onClick={() => handleJoinTable(roomId, table.id)}
                  >
                    Watch
                  </Button>
                </div>
                <div className="flex flex-col gap-1 border-gray-300">
                  {seatMapping.map((row: number[], rowIndex: number) => (
                    <div key={rowIndex} className="flex flex-row gap-1">
                      {row.map((seatNumber: number, colIndex: number) => {
                        const towersUserRoomTable: TowersUserRoomTableWithRelations | undefined =
                          table.towersUserRoomTables.find(
                            (towersUserRoomTable: TowersUserRoomTableWithRelations) =>
                              towersUserRoomTable.seatNumber === seatNumber
                          )
                        return towersUserRoomTable?.towersUserProfile?.user ? (
                          <div
                            key={colIndex}
                            className="flex items-center justify-center w-36 p-1 border border-gray-300 rounded"
                          >
                            <span className="truncate">{towersUserRoomTable.towersUserProfile.user.username}</span>
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
                            onClick={() => handleJoinTable(roomId, table.id)}
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
                  {table.towersUserRoomTables
                    .filter((towersUserRoomTable: TowersUserRoomTableWithRelations) => !towersUserRoomTable.seatNumber)
                    .map(
                      (towersUserRoomTable: TowersUserRoomTableWithRelations) =>
                        towersUserRoomTable.towersUserProfile.user.username
                    )
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
