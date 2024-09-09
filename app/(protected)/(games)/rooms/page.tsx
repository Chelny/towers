import { ReactNode } from "react"
import dynamic from "next/dynamic"
import { NextResponse } from "next/server"
import { GET } from "@/app/api/rooms/route"
import RoomsListSkeleton from "@/components/skeleton/RoomsListSkeleton"
import { ROUTE_ROOMS } from "@/constants"
import { RoomWithCount } from "@/interfaces"

export default async function Rooms(): Promise<ReactNode> {
  const response: NextResponse = await GET()
  const data = await response.json()
  const rooms: RoomWithCount[] = data.data

  return (
    <div className="p-4">
      <h2 className="mb-8 text-3xl">{ROUTE_ROOMS.TITLE}</h2>
      <RoomsList rooms={rooms} />
    </div>
  )
}

const RoomsList = dynamic(() => import("@/components/RoomsList"), {
  loading: () => <RoomsListSkeleton />
})
