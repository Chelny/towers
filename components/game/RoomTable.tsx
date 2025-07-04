"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trans } from "@lingui/react/macro"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { TableType } from "@/enums/table-type"
import { TablePlainObject } from "@/server/towers/classes/Table"
import { TableInvitationPlainObject } from "@/server/towers/classes/TableInvitation"
import { UserPlainObject } from "@/server/towers/classes/User"

type RoomTableProps = {
  roomId: string
  table: TablePlainObject
  user?: UserPlainObject
}

export default function RoomTable({ roomId, table, user }: RoomTableProps): ReactNode {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8],
  ]
  const hostUsername: string | undefined = table.host?.user?.username
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const isPrivate: boolean = table.tableType === TableType.PRIVATE
  const isProtected: boolean = table.tableType === TableType.PROTECTED
  const isWatchAccessGranted: boolean = !isPrivate || hasAccess
  const isSitAccessGranted: boolean = (!isPrivate && !isProtected) || hasAccess

  useEffect(() => {
    const isInvited: boolean = !!user?.tableInvitations.received.some(
      (invitation: TableInvitationPlainObject) => invitation.inviteeUserId === user?.user?.id,
    )
    setHasAccess(isInvited)
  }, [table.id, user?.tableInvitations])

  const handleJoinTable = (seatNumber?: number): void => {
    if (seatNumber) {
      socket?.emit(
        SocketEvents.TABLE_JOIN,
        { roomId, tableId: table.id, seatNumber },
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            socket.emit(SocketEvents.TABLE_GET, { roomId, tableId: table.id })
          }
        },
      )
    }

    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${table.id}`)
  }

  return (
    <div className="flex flex-col">
      <div className={clsx("flex items-center border-b border-b-gray-300", "dark:border-b-dark-game-border")}>
        <div
          className={clsx(
            "basis-16 row-span-2 flex justify-center items-center h-full px-2 border-gray-300",
            "dark:border-dark-game-border",
          )}
        >
          #{table.tableNumber}
        </div>
        <div
          className={clsx(
            "flex-1 flex flex-col gap-1 h-full px-2 border-s border-gray-300 divide-y divide-gray-200",
            "dark:border-dark-game-border dark:divide-dark-game-border",
          )}
        >
          <div className="flex flex-1 gap-1 pt-3 pb-2">
            <div className="basis-28">
              <Button
                className="w-full h-full"
                disabled={!isConnected || !isWatchAccessGranted}
                onClick={() => handleJoinTable()}
              >
                <Trans>Watch</Trans>
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              {seatMapping.map((row: number[], rowIndex: number) => (
                <div key={rowIndex} className="flex flex-row gap-1">
                  {row.map((seatNumber: number, colIndex: number) => {
                    const seatedUser: UserPlainObject | undefined = table?.users.find(
                      (user: UserPlainObject) => user.tables[table.id]?.seatNumber === seatNumber,
                    )

                    return seatedUser ? (
                      <div
                        key={colIndex}
                        className={clsx(
                          "flex items-center justify-center w-28 p-1 border border-gray-300 rounded-sm",
                          "dark:border-dark-game-border",
                        )}
                      >
                        <span className="truncate">{seatedUser.user?.username}</span>
                      </div>
                    ) : (
                      <Button
                        key={colIndex}
                        className="w-28"
                        disabled={!isConnected || !isSitAccessGranted}
                        onClick={() => handleJoinTable(seatNumber)}
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
                .filter((user: UserPlainObject) => typeof user.tables[table.id]?.seatNumber === "undefined")
                .map((user: UserPlainObject) => user.user?.username)
                .join(", ")}
            </div>
          </div>
          <div className="flex py-1 text-sm">
            {table.isRated && (
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
