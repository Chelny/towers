"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import { ITowersRoomWithUsersCount } from "@prisma/client"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { TowersRoomState } from "@/interfaces/socket"
import { useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"

type RoomsListProps = {
  rooms: ITowersRoomWithUsersCount[]
}

export default function RoomsList({ rooms }: RoomsListProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { status } = useSessionData()
  const joinedRooms: Record<string, TowersRoomState> = useAppSelector((state: RootState) => state.socket.towers)

  const handleJoinRoom = (roomId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms?.map((room: ITowersRoomWithUsersCount) => (
        <li
          key={room.id}
          className={clsx(
            "flex flex-col gap-2 p-4 border border-gray-300 rounded bg-white",
            room.full && "has-[button:disabled]:opacity-50 has-[button:disabled]:cursor-not-allowed",
          )}
        >
          <div className="font-medium">{room.name}</div>
          <div>{room.difficulty}</div>
          <div>{room.usersCount} users</div>
          <div>
            <Button
              type="button"
              className="w-full"
              disabled={status !== "authenticated" || room.full || !!joinedRooms[room.id]}
              onClick={() => handleJoinRoom(room.id)}
            >
              {!!joinedRooms[room.id] ? "Joined" : "Join"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
