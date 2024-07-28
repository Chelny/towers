import { ReactNode } from "react"
import { NextResponse } from "next/server"
import { GET, RoomWithCount } from "@/app/api/rooms/route"
import RoomsList from "@/components/RoomsList"
import { ROUTE_ROOMS } from "@/constants"

export default async function Rooms(): Promise<ReactNode> {
  const response: NextResponse = await GET()
  const data = await response.json()
  const rooms: RoomWithCount[] = data.data

  return (
    <div className="p-4">
      <h2 className="mb-8 text-4xl">{ROUTE_ROOMS.TITLE}</h2>
      <RoomsList rooms={rooms} />
    </div>
  )
}
