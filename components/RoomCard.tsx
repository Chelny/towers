import { ReactNode } from "react"
import router from "next/router"
import clsx from "clsx/lite"
import { RoomWithCount } from "@/app/api/rooms/route"
import Button from "@/components/ui/Button"
import { ROUTE_TOWERS } from "@/constants"

type RoomCardProps = {
  room: RoomWithCount
}

export default function RoomCard({ room }: RoomCardProps): ReactNode {
  return (
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
          disabled={room.full}
          onClick={() => router.push(`${ROUTE_TOWERS.PATH}?room=${room.id}`)}
        >
          Join
        </Button>
      </div>
    </li>
  )
}
