import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function PasskeysFormSkeleton(): ReactNode {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className={clsx("w-52 h-6 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      <div className="flex flex-col gap-2">
        <div className={clsx("h-6 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
        <div className={clsx("h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      </div>
      {Array.from({ length: 3 }).map((_, index: number) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <div className="flex-1 flex flex-col gap-2">
            <div className={clsx("h-6 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
            <div className={clsx("h-4 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
          </div>
          <div className="flex-1 flex items-center justify-end gap-2">
            <div className={clsx("w-8 h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
            <div className={clsx("w-8 h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
          </div>
        </div>
      ))}
      <div className={clsx("h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
    </div>
  )
}
