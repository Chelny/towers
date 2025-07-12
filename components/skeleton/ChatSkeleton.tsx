import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function ChatSkeleton(): ReactNode {
  return (
    <div className="overflow-hidden flex flex-col gap-1 h-full animate-pulse">
      <div className={clsx("w-full h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      <div className="overflow-y-auto flex-1 my-1">
        {Array.from({ length: 10 }).map((_, index: number) => (
          <div key={index} className="flex items-center gap-1 py-2">
            <div className={clsx("w-36 h-4 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
            <div className={clsx("w-full h-4 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
          </div>
        ))}
      </div>
    </div>
  )
}
