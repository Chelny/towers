"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plural, Trans, useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { useSocket } from "@/context/SocketContext"
import { RoomLevel, RoomPlainObject } from "@/server/towers/classes/Room"
import { UserPlainObject } from "@/server/towers/classes/User"

export default function RoomsList(): ReactNode {
  const router = useRouter()
  const { socketRef, session } = useSocket()
  const { t } = useLingui()
  const [rooms, setRooms] = useState<RoomPlainObject[]>([])

  useEffect(() => {
    socketRef.current?.emit(SocketEvents.ROOMS_GET)

    const handleRoomsList = ({ rooms }: { rooms: RoomPlainObject[] }): void => {
      setRooms(rooms)
    }

    const handleRoomsListUpdated = (): void => {
      socketRef.current?.emit(SocketEvents.ROOMS_GET)
    }

    socketRef.current?.on(SocketEvents.ROOMS_LIST, handleRoomsList)
    socketRef.current?.on(SocketEvents.ROOMS_LIST_UPDATED, handleRoomsListUpdated)

    return () => {
      socketRef.current?.off(SocketEvents.ROOMS_LIST, handleRoomsList)
      socketRef.current?.off(SocketEvents.ROOMS_LIST_UPDATED, handleRoomsListUpdated)
    }
  }, [socketRef.current])

  const handleJoinRoom = (roomId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms?.map((room: RoomPlainObject) => {
        const usersCount: number = room.users?.length
        const isUserInRoom: boolean = room.users?.some((user: UserPlainObject) => user.user?.id === session?.user?.id)

        return (
          <li
            key={room.id}
            className={clsx(
              "flex flex-col gap-2 p-4 border border-gray-300 rounded-sm bg-white",
              room.isFull && "has-[button:disabled]:opacity-50",
              "dark:border-dark-card-border dark:bg-dark-card-background",
            )}
          >
            <div className="font-medium">{room.name}</div>
            <div>
              {room.level === RoomLevel.SOCIAL ? (
                <Trans>Social</Trans>
              ) : room.level === RoomLevel.BEGINNER ? (
                <Trans>Beginner</Trans>
              ) : room.level === RoomLevel.INTERMEDIATE ? (
                <Trans>Intermediate</Trans>
              ) : room.level === RoomLevel.ADVANCED ? (
                <Trans>Advanced</Trans>
              ) : undefined}
            </div>
            <div>
              <Plural value={usersCount} zero="no users" one="# user" other="# users" />
            </div>
            <div>
              <Button
                type="button"
                className={clsx("w-full", room.isFull && "cursor-not-allowed")}
                disabled={room.isFull || isUserInRoom}
                onClick={() => !room.isFull && handleJoinRoom(room.id)}
              >
                {isUserInRoom
                  ? t({ message: "Joined" })
                  : room.isFull
                    ? t({ message: "Full" })
                    : t({ message: "Join" })}
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
