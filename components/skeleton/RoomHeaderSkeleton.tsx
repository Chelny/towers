import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function RoomHeaderSkeleton(): ReactNode {
  return (
    <div className="py-2 animate-pulse">
      <div className={clsx("w-1/3 h-8 m-4 rounded-md bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
    </div>
  )
}
