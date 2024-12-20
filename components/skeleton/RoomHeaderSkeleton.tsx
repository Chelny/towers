import { ReactNode } from "react"

export default function RoomHeaderSkeleton(): ReactNode {
  return (
    <div className="py-2 animate-pulse">
      <div className="w-1/3 h-8 m-4 rounded-md bg-gray-200"></div>
    </div>
  )
}
