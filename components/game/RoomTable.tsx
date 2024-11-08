"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import { ITowersTable, ITowersUserRoomTable, TableType } from "@prisma/client"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useAppSelector } from "@/lib/hooks"
import { selectIsRoomTablesLoading, selectTableInfo, selectTableUsers } from "@/redux/selectors/socket-selectors"
import { RootState } from "@/redux/store"

type RoomTableProps = {
  roomId: string
  tableId: string
}

export default function RoomTable({ roomId, tableId }: RoomTableProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const isRoomTablesLoading: boolean = useAppSelector((state: RootState) => selectIsRoomTablesLoading(state, roomId))
  const tableInfo: ITowersTable | null = useAppSelector((state: RootState) => selectTableInfo(state, roomId, tableId))
  const tableUsers: ITowersUserRoomTable[] = useAppSelector((state: RootState) =>
    selectTableUsers(state, roomId, tableId),
  )
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8],
  ]

  const handleJoinTable = (): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${tableInfo?.roomId}&table=${tableInfo?.id}`)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center border-b-2 border-b-gray-300">
        <div className="basis-20 row-span-2 flex justify-center items-center h-full px-2 border-gray-300">
          #{tableInfo?.tableNumber}
        </div>
        <div className="flex-1 flex flex-col gap-1 h-full px-2 border-l border-gray-300 divide-y divide-gray-200">
          <div className="flex flex-1 gap-1 pt-3 pb-2">
            <div className="basis-32 border-gray-300">
              <Button
                className="w-full h-full"
                disabled={isRoomTablesLoading || tableInfo?.tableType === TableType.PRIVATE}
                onClick={() => handleJoinTable()}
              >
                Watch
              </Button>
            </div>
            <div className="flex flex-col gap-1 border-gray-300">
              {seatMapping.map((row: number[], rowIndex: number) => (
                <div key={rowIndex} className="flex flex-row gap-1">
                  {row.map((seatNumber: number, colIndex: number) => {
                    const userRoomTable: ITowersUserRoomTable | undefined = tableUsers?.find(
                      (userRoomTable: ITowersUserRoomTable) => userRoomTable.seatNumber === seatNumber,
                    )
                    return userRoomTable?.userProfile?.user ? (
                      <div
                        key={colIndex}
                        className="flex items-center justify-center w-36 p-1 border border-gray-300 rounded"
                      >
                        <span className="truncate">{userRoomTable.userProfile?.user?.username}</span>
                      </div>
                    ) : (
                      <Button
                        key={colIndex}
                        className="w-36"
                        disabled={
                          isRoomTablesLoading ||
                          tableInfo?.tableType === TableType.PROTECTED ||
                          tableInfo?.tableType === TableType.PRIVATE
                        }
                        onClick={() => handleJoinTable()}
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
              {tableUsers
                ?.filter((userRoomTable: ITowersUserRoomTable) => !userRoomTable.seatNumber)
                .map((userRoomTable: ITowersUserRoomTable) => userRoomTable.userProfile?.user?.username)
                .join(", ")}
            </div>
          </div>
          <div className="flex py-1 text-sm">
            {tableInfo?.rated && <span>Option: rated&nbsp;-&nbsp;</span>}
            <span>Host: {tableInfo?.host?.user?.username}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
