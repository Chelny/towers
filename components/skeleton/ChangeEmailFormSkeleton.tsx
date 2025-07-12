import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function ChangeEmailFormSkeleton(): ReactNode {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className={clsx("w-64 h-6 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      <div className="flex flex-col gap-2">
        <div className={clsx("w-48 h-6 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
        <div className={clsx("h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      </div>
      <div className={clsx("h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
    </div>
  )
}
