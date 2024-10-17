"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import { ITowersTable, ITowersUserProfileWithRelations, TableType } from "@prisma/client"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useAppDispatch } from "@/lib/hooks"
import { AppDispatch } from "@/redux/store"
import { joinTable } from "@/redux/thunks/table-thunks"

type RoomTableProps = {
  roomId: string
  table: ITowersTable
  isRoomTablesLoading: boolean
}

export default function RoomTable({ roomId, table, isRoomTablesLoading }: RoomTableProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const dispatch: AppDispatch = useAppDispatch()
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8],
  ]

  const handleJoinTable = (roomId: string, tableId: string): void => {
    dispatch(joinTable({ roomId, tableId }))
      .unwrap()
      .then(() => {
        router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`)
      })
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center border-b-2 border-b-gray-300">
        <div className="basis-20 row-span-2 flex justify-center items-center h-full px-2 border-gray-300">
          #{table.tableNumber}
        </div>
        <div className="flex-1 flex flex-col gap-1 h-full px-2 border-l border-gray-300 divide-y divide-gray-200">
          <div className="flex flex-1 gap-1 pt-3 pb-2">
            <div className="basis-32 border-gray-300">
              <Button
                className="w-full h-full"
                disabled={isRoomTablesLoading || table.tableType === TableType.PRIVATE}
                onClick={() => handleJoinTable(roomId, table.id)}
              >
                Watch
              </Button>
            </div>
            <div className="flex flex-col gap-1 border-gray-300">
              {seatMapping.map((row: number[], rowIndex: number) => (
                <div key={rowIndex} className="flex flex-row gap-1">
                  {row.map((seatNumber: number, colIndex: number) => {
                    const towersUserProfile: ITowersUserProfileWithRelations | undefined = table.userProfiles.find(
                      (userProfiles: ITowersUserProfileWithRelations) => userProfiles.seatNumber === seatNumber
                    )
                    return towersUserProfile?.user ? (
                      <div
                        key={colIndex}
                        className="flex items-center justify-center w-36 p-1 border border-gray-300 rounded"
                      >
                        <span className="truncate">{towersUserProfile.user.username}</span>
                      </div>
                    ) : (
                      <Button
                        key={colIndex}
                        className="w-36"
                        disabled={
                          isRoomTablesLoading ||
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
              {table.userProfiles
                .filter((userProfiles: ITowersUserProfileWithRelations) => !userProfiles.seatNumber)
                .map((userProfiles: ITowersUserProfileWithRelations) => userProfiles.user.username)
                .join(", ")}
            </div>
          </div>
          <div className="flex py-1 text-sm">
            {table.rated && <span>Option: rated&nbsp;-&nbsp;</span>}
            <span>Host: {table.host?.username}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
