"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Trans } from "@lingui/react/macro"
import { ITowersUserProfile, ITowersUserTableWithRelations, TableType } from "@prisma/client"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { TowersRoomTableState } from "@/interfaces/socket"

type RoomTableProps = {
  table: TowersRoomTableState
  isTablesLoading: boolean
}

export default function RoomTable({ table, isTablesLoading = true }: RoomTableProps): ReactNode {
  const router = useRouter()
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8],
  ]
  const hostUsername: string | undefined = table?.info?.host?.user?.username

  const handleJoinTable = (): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${table?.info?.roomId}&table=${table?.info?.id}`)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center border-b border-b-gray-300">
        <div className="basis-16 row-span-2 flex justify-center items-center h-full px-2 border-gray-300">
          #{table?.info?.tableNumber}
        </div>
        <div className="flex-1 flex flex-col gap-1 h-full px-2 border-s border-gray-300 divide-y divide-gray-200">
          <div className="flex flex-1 gap-1 pt-3 pb-2">
            <div className="basis-28 border-gray-300">
              <Button
                className="w-full h-full"
                disabled={isTablesLoading || table?.info?.tableType === TableType.PRIVATE}
                onClick={() => handleJoinTable()}
              >
                <Trans>Watch</Trans>
              </Button>
            </div>
            <div className="flex flex-col gap-1 border-gray-300">
              {seatMapping.map((row: number[], rowIndex: number) => (
                <div key={rowIndex} className="flex flex-row gap-1">
                  {row.map((seatNumber: number, colIndex: number) => {
                    const seatedUser: ITowersUserProfile | undefined = table?.users?.find(
                      (userProfile: ITowersUserProfile) =>
                        userProfile.userTables?.some(
                          (userTable: ITowersUserTableWithRelations) => userTable.seatNumber === seatNumber,
                        ),
                    )

                    return seatedUser ? (
                      <div
                        key={colIndex}
                        className="flex items-center justify-center w-28 p-1 border border-gray-300 rounded"
                      >
                        <span className="truncate">{seatedUser.user?.username}</span>
                      </div>
                    ) : (
                      <Button
                        key={colIndex}
                        className="w-28"
                        disabled={
                          isTablesLoading ||
                          table?.info?.tableType === TableType.PROTECTED ||
                          table?.info?.tableType === TableType.PRIVATE
                        }
                        onClick={() => handleJoinTable()}
                      >
                        <Trans>Join</Trans>
                      </Button>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="flex-1 px-2 line-clamp-3">
              {/* List non-seated players by username, separated by commas */}
              {table?.users
                ?.filter((towersUserProfile: ITowersUserProfile) =>
                  towersUserProfile.userTables?.some(
                    (userTable: ITowersUserTableWithRelations) => !userTable.seatNumber,
                  ),
                )
                .map((towersUserProfile: ITowersUserProfile) => towersUserProfile.user?.username)
                .join(", ")}
            </div>
          </div>
          <div className="flex py-1 text-sm">
            {table?.info?.rated && (
              <span>
                <Trans>Option: rated</Trans>&nbsp;-&nbsp;
              </span>
            )}
            <span>
              <Trans>Host: {hostUsername}</Trans>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
