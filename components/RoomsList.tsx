"use client"

import { ReactNode, useEffect } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"
import clsx from "clsx/lite"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { RoomWithCount } from "@/interfaces/room"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { initSocket } from "@/redux/features/socket-slice"
import { AppDispatch, RootState } from "@/redux/store"
import { joinRoom } from "@/redux/thunks/socket-thunks"

type RoomsListProps = {
  rooms: RoomWithCount[]
}

export default function RoomsList({ rooms }: RoomsListProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { status } = useSessionData()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  const dispatch: AppDispatch = useAppDispatch()
  const { data: session } = useSessionData()

  useEffect(() => {
    if (status === "authenticated") {
      if (!isConnected) {
        dispatch(initSocket())
      }
    }
  }, [status, isConnected])

  const handleJoinRoom = (roomId: string): void => {
    dispatch(joinRoom({ room: roomId, isTable: false, username: session?.user.username }))
      .unwrap()
      .then((data) => {
        router.push(`${ROUTE_TOWERS.PATH}?room=${data.room}`)
      })
      .catch((error) => {
        console.error("Error joining room:", error)
      })
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms.map((room: RoomWithCount) => (
        <li
          key={room.id}
          className={clsx(
            "flex flex-col gap-2 p-4 border border-gray-300 rounded bg-white",
            room.full && "has-[button:disabled]:opacity-50 has-[button:disabled]:cursor-not-allowed"
          )}
        >
          <div className="font-medium">{room.name}</div>
          <div>{room.difficulty}</div>
          <div>{room._count.towersGameUsers} users</div>
          <div>
            {/* TODO: Write "Joined" and disable button if user is already in the room */}
            <Button
              type="button"
              className="w-full"
              disabled={room.full || status !== "authenticated"}
              onClick={() => handleJoinRoom(room.id)}
            >
              Join
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
