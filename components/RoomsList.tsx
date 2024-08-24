"use client"

import { ReactNode, useEffect } from "react"
import dynamic from "next/dynamic"
import { useDispatch, useSelector } from "react-redux"
import { RoomWithCount } from "@/app/api/rooms/route"
import RoomCardSkeleton from "@/components/skeleton/RoomCardSkeleton"
import { initSocket } from "@/features"
import { useSessionData } from "@/hooks"
import { AppDispatch, RootState } from "@/redux"

type RoomsListProps = {
  rooms: RoomWithCount[]
}

export default function RoomsList({ rooms }: RoomsListProps): ReactNode {
  const { status } = useSessionData()
  const { isConnected } = useSelector((state: RootState) => state.socket)
  const dispatch: AppDispatch = useDispatch()

  useEffect(() => {
    if (status === "authenticated") {
      if (!isConnected) {
        dispatch(initSocket())
      }
    }
  }, [status, isConnected, dispatch])

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms.map((room: RoomWithCount) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </ul>
  )
}

const RoomCard = dynamic(() => import("@/components/RoomCard"), {
  loading: () => <RoomCardSkeleton />
})
