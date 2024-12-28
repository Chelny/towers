"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { plural } from "@lingui/core/macro"
import { Trans, useLingui } from "@lingui/react/macro"
import { ITowersRoomWithUsersCount, RoomLevel } from "@prisma/client"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { TowersRoomState } from "@/interfaces/socket"
import { authClient } from "@/lib/auth-client"
import { useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"

type RoomsListProps = {
  rooms: ITowersRoomWithUsersCount[]
}

export default function RoomsList({ rooms }: RoomsListProps): ReactNode {
  const router = useRouter()
  const { isPending } = authClient.useSession()
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const joinedRooms: Record<string, TowersRoomState> = useAppSelector((state: RootState) => state.socket.towers)
  const { t } = useLingui()

  const handleJoinRoom = (roomId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms?.map((room: ITowersRoomWithUsersCount) => {
        const usersCount: number = room.usersCount
        return (
          <li
            key={room.id}
            className={clsx(
              "flex flex-col gap-2 p-4 border border-gray-300 rounded bg-white",
              room.full && "has-[button:disabled]:opacity-50 has-[button:disabled]:cursor-not-allowed",
            )}
          >
            <div className="font-medium">{room.name}</div>
            <div>
              {room.difficulty === RoomLevel.SOCIAL ? (
                <Trans>Social</Trans>
              ) : room.difficulty === RoomLevel.BEGINNER ? (
                <Trans>Beginner</Trans>
              ) : room.difficulty === RoomLevel.INTERMEDIATE ? (
                <Trans>Intermediate</Trans>
              ) : room.difficulty === RoomLevel.ADVANCED ? (
                <Trans>Advanced</Trans>
              ) : null}
            </div>
            <div>{plural(usersCount, { zero: "no users", one: "# user", other: "# users" })}</div>
            <div>
              <Button
                type="button"
                className="w-full"
                disabled={isMounted ? isPending || room.full || !!joinedRooms[room.id] : false}
                onClick={() => handleJoinRoom(room.id)}
              >
                {!!joinedRooms[room.id] ? t({ message: "Joined" }) : t({ message: "Join" })}
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
