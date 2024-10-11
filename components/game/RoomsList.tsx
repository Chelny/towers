"use client"

import { ReactNode } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import { IRoomListItemWithUsersCount } from "@prisma/client"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RoomState } from "@/redux/features/socket-slice"
import { AppDispatch, RootState } from "@/redux/store"
import { joinRoom } from "@/redux/thunks/socket-thunks"

type RoomsListProps = {
  rooms: IRoomListItemWithUsersCount[]
}

export default function RoomsList({ rooms }: RoomsListProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { status } = useSessionData()
  const joinedRooms: Record<string, RoomState> = useAppSelector((state: RootState) => state.socket.rooms)
  const dispatch: AppDispatch = useAppDispatch()

  const handleJoinRoom = (roomId: string): void => {
    dispatch(joinRoom({ roomId }))
      .unwrap()
      .then(() => {
        router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
      })
      .catch((error) => {
        console.error("Error joining room:", error)
      })
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms.map((room: IRoomListItemWithUsersCount) => (
        <li
          key={room.id}
          className={clsx(
            "flex flex-col gap-2 p-4 border border-gray-300 rounded bg-white",
            room.full && "has-[button:disabled]:opacity-50 has-[button:disabled]:cursor-not-allowed"
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
