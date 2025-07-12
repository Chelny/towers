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
    <div
      className={clsx(
        "grid grid-rows-[auto_1fr] h-full border border-gray-200 bg-white animate-pulse",
        "dark:border-dark-game-players-border dark:bg-dark-game-players-row-odd",
      )}
    >
      <div
        className={clsx(
          "grid gap-1 pe-3 border-b border-gray-200 bg-gray-50",
          "rtl:divide-x-reverse",
          "dark:border-b-dark-game-players-border dark:border-dark-game-players-border dark:divide-dark-game-players-border dark:bg-dark-game-players-header",
          isRatingsVisible && isTableNumberVisible ? "grid-cols-[5fr_4fr_3fr]" : "grid-cols-[8fr_4fr]",
        )}
      >
        <div className="flex items-center gap-2 p-2">
          <span className="w-1/3 h-4 rounded-sm"></span>
          <div className="w-4 h-4 rounded-sm" />
        </div>
        {isRatingsVisible && (
          <div className="flex items-center gap-2 p-2">
            <span className="w-1/3 h-4 rounded-sm"></span>
            <div className="w-4 h-4 rounded-sm" />
          </div>
        )}
        {isTableNumberVisible && (
          <div className="flex items-center gap-2 p-2 me-4">
            <span className="w-1/3 h-4 rounded-sm"></span>
            <div className="w-4 h-4 rounded-sm" />
          </div>
        )}
      </div>
      <div className="overflow-y-scroll pointer-events-none">
        {Array.from({ length: 20 }).map((_, index: number) => (
          <div
            key={index}
            className={clsx(
              "grid gap-1 animate-pulse",
              "rtl:divide-x-reverse",
              "dark:divide-dark-game-players-border dark:even:bg-dark-game-players-row-even dark:odd:bg-dark-game-players-row-odd",
              isRatingsVisible && isTableNumberVisible ? "grid-cols-[5fr_4fr_3fr]" : "grid-cols-[8fr_4fr]",
            )}
          >
            <div className="p-2 truncate">
              <div className="flex items-center gap-1">
                {isRatingsVisible && <div className="shrink-0 w-4 h-4 rounded-sm" />}
                <div className="w-36 h-4 rounded-sm" />
              </div>
            </div>
            {isRatingsVisible && (
              <div className="p-2 truncate">
                <div className="self-center h-4 mx-2" />
              </div>
            )}
            {isTableNumberVisible && <div className="self-center h-4 mx-2" />}
          </div>
        ))}
      </div>
    </div>
  )
}
