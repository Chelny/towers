import React, { ReactNode } from "react"
import clsx from "clsx/lite"

export default function RoomCardSkeleton(): ReactNode {
  return (
    <li className={clsx("flex flex-col gap-2 p-4 border border-gray-200 rounded bg-white", "animate-pulse")}>
      <div className="font-medium h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="h-10 bg-gray-300 rounded w-full"></div>
    </li>
  )
}
