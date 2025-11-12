import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";

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
        "grid grid-rows-[auto_1fr] h-full border border-gray-200 bg-white",
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
          <span>
            <Trans>Name</Trans>
          </span>
          <div className="w-4 h-4 rounded-sm" />
        </div>
        {isRatingsVisible && (
          <div className="flex items-center gap-2 p-2">
            <span>
              <Trans>Rating</Trans>
            </span>
            <div className="w-4 h-4 rounded-sm" />
          </div>
        )}
        {isTableNumberVisible && (
          <div className="flex items-center gap-2 p-2">
            <span>
              <Trans>Table</Trans>
            </span>
            <div className="w-4 h-4 rounded-sm" />
          </div>
        )}
      </div>
      <div className="overflow-y-scroll animate-pulse">
        {Array.from({ length: 50 }).map((_, index: number) => (
          <div
            key={index}
            className={clsx(
              "grid gap-1",
              "rtl:divide-x-reverse",
              "dark:divide-dark-game-players-border dark:even:bg-dark-game-players-row-even dark:odd:bg-dark-game-players-row-odd",
              isRatingsVisible && isTableNumberVisible ? "grid-cols-[5fr_4fr_3fr]" : "grid-cols-[8fr_4fr]",
            )}
          >
            <div className="p-2 truncate">
              <div className="flex items-center gap-1">
                {isRatingsVisible && (
                  <div
                    className={clsx(
                      "shrink-0 w-4 h-4 rounded-sm bg-gray-200",
                      "dark:bg-dark-skeleton-content-background",
                    )}
                  />
                )}
                <div
                  className={clsx(
                    "w-36 h-4 rounded-sm bg-gray-200 truncate",
                    "dark:bg-dark-skeleton-content-background",
                  )}
                />
              </div>
            </div>
            {isRatingsVisible && (
              <div className="p-2 truncate">
                <div
                  className={clsx(
                    "self-center h-4 me-2 rounded-sm bg-gray-200",
                    "dark:bg-dark-skeleton-content-background",
                  )}
                />
              </div>
            )}
            {isTableNumberVisible && (
              <div
                className={clsx(
                  "self-center h-4 me-2 rounded-sm bg-gray-200",
                  "dark:bg-dark-skeleton-content-background",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
