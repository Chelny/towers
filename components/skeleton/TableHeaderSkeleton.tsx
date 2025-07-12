import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function TableHeaderSkeleton(): ReactNode {
  return (
    <div className="[grid-area:banner] py-2 animate-pulse">
      <div className={clsx("mx-4 mt-4 h-8 w-1/3 rounded-md bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      <div className={clsx("mx-4 my-2 h-6 w-48 rounded-md bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
    </div>
  )
}
