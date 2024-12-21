import { ReactNode } from "react"
import clsx from "clsx/lite"

type PlayersListSkeletonProps = {
  isRatingsVisible?: boolean | null
  isTableNumberVisible?: boolean
}

export default function PlayersListSkeleton({
  isRatingsVisible = true,
  isTableNumberVisible = true,
}: PlayersListSkeletonProps): ReactNode {
  return (
    <div className="grid grid-rows-[auto,1fr] h-fill border bg-white">
      <div
        className={clsx(
          "grid gap-1 border-b border-gray-200 bg-gray-50 animate-pulse",
          isRatingsVisible ? "grid-cols-[6fr,3fr,3fr]" : "grid-cols-[9fr,3fr]",
        )}
      >
        <div className="flex items-center gap-2 p-2 bg-gray-100">
          <span className="w-1/3 h-4 rounded bg-gray-200"></span>
          <div className="w-4 h-4 rounded bg-gray-200"></div>
        </div>
        {isRatingsVisible && (
          <div className="flex items-center gap-2 p-2 bg-gray-100">
            <span className="w-1/3 h-4 rounded bg-gray-200"></span>
            <div className="w-4 h-4 rounded bg-gray-200"></div>
          </div>
        )}
        {isTableNumberVisible && (
          <div className="flex items-center gap-2 p-2 me-4 bg-gray-100">
            <span className="w-1/3 h-4 rounded bg-gray-200"></span>
            <div className="w-4 h-4 rounded bg-gray-200"></div>
          </div>
        )}
      </div>
      <div className="overflow-y-scroll">
        {Array.from({ length: 10 }).map((_, index: number) => (
          <div
            key={index}
            className={clsx(
              "grid gap-1 divide-gray-200 animate-pulse",
              isRatingsVisible && isTableNumberVisible ? "grid-cols-[6fr,3fr,3fr]" : "grid-cols-[9fr,3fr]",
            )}
          >
            <div className="p-2">
              <div className="flex items-center gap-1">
                {isRatingsVisible && <div className="flex-shrink-0 w-4 h-4 rounded bg-gray-200"></div>}
                <div className="w-36 h-4 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="self-center h-4 mx-2 rounded bg-gray-200"></div>
            {isTableNumberVisible && <div className="self-center h-4 mx-2 rounded bg-gray-200"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}
