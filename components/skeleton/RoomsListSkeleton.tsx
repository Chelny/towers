import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function RoomsListSkeleton(): ReactNode {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8 animate-pulse">
      {Array.from({ length: 12 }).map((_, index: number) => (
        <li
          key={index}
          className={clsx(
            "flex flex-col gap-4 h-40 p-4 border border-gray-200 rounded-sm bg-white",
            "dark:border-dark-skeleton-border dark:bg-dark-skeleton-background",
          )}
        >
          <div
            className={clsx("font-medium h-5 rounded-sm bg-gray-200 w-3/4", "dark:bg-dark-skeleton-content-background")}
          />
          <div className={clsx("h-4 rounded-sm bg-gray-200 w-1/4", "dark:bg-dark-skeleton-content-background")} />
          <div className={clsx("h-4 rounded-sm bg-gray-200 w-1/2", "dark:bg-dark-skeleton-content-background")} />
          <div className={clsx("h-8 rounded-sm bg-gray-200 w-full", "dark:bg-dark-skeleton-content-background")} />
        </li>
      ))}
    </ul>
  )
}
