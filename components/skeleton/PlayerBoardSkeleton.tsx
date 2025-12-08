import { ReactNode } from "react";
import clsx from "clsx/lite";

type PlayerBoardSkeletonProps = {
  isOpponentBoard: boolean
  isReversed: boolean
};

export default function PlayerBoardSkeleton({
  isOpponentBoard = false,
  isReversed = false,
}: PlayerBoardSkeletonProps): ReactNode {
  return (
    <div className={clsx("flex flex-col animate-pulse", isOpponentBoard && "w-player-board-opponent-width")}>
      {/* User avatar + username */}
      <div
        className={clsx(
          "flex justify-start items-center gap-2 w-full px-1 mx-1",
          !isOpponentBoard ? "w-[175px] h-6" : "h-4",
          !isOpponentBoard && isReversed && "ms-2 me-13",
          // !isOpponentBoard && !isReversed && "ms-16",
        )}
      >
        <div
          className={clsx(
            "flex rounded-full bg-gray-200",
            isOpponentBoard ? "w-4 h-4" : "w-6 h-6",
            "dark:bg-dark-skeleton-content-background",
          )}
        />
        <div
          className={clsx(
            "rounded-sm bg-gray-200",
            isOpponentBoard ? "h-3 w-16" : "h-4 w-24",
            "dark:bg-dark-skeleton-content-background",
          )}
        />
      </div>

      {/* Main board */}
      <div
        className={clsx(
          "grid gap-2 w-full mt-2 border-y-8 border-gray-300 bg-gray-200",
          isOpponentBoard
            ? "[grid-template-areas:'board-grid-container''board-grid-container']"
            : isReversed
              ? "[grid-template-areas:'board-grid-container_preview-piece''board-grid-container_power-bar']"
              : "[grid-template-areas:'preview-piece_board-grid-container''power-bar_board-grid-container']",
          isOpponentBoard ? "" : "grid-rows-[max-content_auto] grid-cols-[max-content_auto]",
          isReversed
            ? "border-s-2 border-s-gray-300 border-e-8 border-e-gray-300"
            : "border-s-8 border-s-gray-300 border-e-2 border-e-gray-300",
          "dark:border-dark-skeleton-border dark:bg-dark-skeleton-content-background",
        )}
      >
        <div
          className={clsx(
            "[grid-area:board-grid-container] relative grid w-full rounded-sm bg-gray-200",
            isOpponentBoard
              ? "grid-rows-(--grid-rows-grid-container-opponent) w-grid-container-opponent-width"
              : "grid-rows-(--grid-rows-grid-container) w-grid-container-width",
            "before:content-[attr(data-seat-number)] before:absolute before:start-1/2 before:-translate-x-1/2 before:text-[7rem] before:font-bold before:text-center",
            "dark:bg-dark-skeleton-content-background",
          )}
        />

        {/* Next piece and power bar */}
        {!isOpponentBoard && (
          <>
            <div
              className={clsx(
                "[grid-area:preview-piece] flex flex-col items-center justify-center h-preview-piece-height px-2 py-2 rounded-sm bg-gray-200",
                isOpponentBoard ? "" : "w-preview-piece-width",
                "dark:bg-dark-skeleton-content-background",
              )}
            />
            <div
              className={clsx(
                "[grid-area:power-bar] flex flex-col items-center justify-end h-power-bar-height px-2 py-2 rounded-sm bg-gray-200",
                isOpponentBoard ? "" : "w-power-bar-width",
                "dark:bg-dark-skeleton-content-background",
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
