import { ReactNode } from "react"
import clsx from "clsx/lite"

type PlayersListSkeletonProps = {
  full?: boolean
}

export default function PlayersListSkeleton({ full = false }: PlayersListSkeletonProps): ReactNode {
  return (
    <div className="flex flex-col h-fill border animate-pulse">
      {full && (
        <div className="flex border-b border-gray-200 divide-x-2 divide-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 w-1/2 p-2 bg-gray-100">
            <span className="w-1/3 h-4 rounded bg-gray-200"></span>
            <div className="w-4 h-4 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center gap-2 w-1/4 p-2 bg-gray-100">
            <span className="w-1/3 h-4 rounded bg-gray-200"></span>
            <div className="w-4 h-4 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center gap-2 w-1/4 p-2 me-4 bg-gray-100">
            <span className="w-1/3 h-4 rounded bg-gray-200"></span>
            <div className="w-4 h-4 rounded bg-gray-200"></div>
          </div>
        </div>
      )}
      <div className={clsx("overflow-y-scroll", full ? "flex-1 max-h-80" : "min-w-60 h-full")}>
        {Array.from({ length: 10 }).map((_, index: number) => (
          <div key={index} className={clsx("flex divide-gray-200", full ? "divide-x-2 select-none" : "divide-x")}>
            <div className={clsx(full ? "w-1/2 p-2" : "w-3/4 p-1")}>
              <div className="flex items-center gap-1">
                {full && <div className="flex-shrink-0 w-4 h-4 rounded bg-gray-200"></div>}
                <div className="w-36 h-4 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="self-center w-1/4 h-4 mx-2 rounded bg-gray-200"></div>
            {full && <div className="self-center w-1/4 h-4 mx-2 rounded bg-gray-200"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}
