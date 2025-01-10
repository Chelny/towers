"use client"

import { ReactNode } from "react"
import { Trans } from "@lingui/react/macro"
import clsx from "clsx/lite"
import Grid from "@/components/towers/Grid"
import NextPiece from "@/components/towers/NextPiece"
import PowerBar from "@/components/towers/PowerBar"
import Button from "@/components/ui/Button"
import UserAvatar from "@/components/UserAvatar"
import { useTowers } from "@/hooks/useTowers"
import { authClient, Session } from "@/lib/auth-client"

type PlayerBoardProps = {
  seatNumber: number
  isOpponentBoard: boolean
  isReversed: boolean
  user: Session["user"] | undefined | null
  isSeated: boolean
  isReady: boolean
  onChooseSeat: (seatNumber: number | null) => void
  onReady: (seatNumber: number) => void
}

export default function PlayerBoard({
  seatNumber,
  isOpponentBoard,
  isReversed,
  user,
  isSeated,
  isReady,
  onChooseSeat,
  onReady,
}: PlayerBoardProps): ReactNode {
  const { board, startGame, isPlaying, isGameOver, score, nextPieces, powerBar } = useTowers()
  const { data: session } = authClient.useSession()

  const handleSeatChange = (seatNumber: number | null): void => {
    onChooseSeat(seatNumber)
  }

  return (
    <div className={clsx("flex flex-col", isOpponentBoard && "w-player-board-opponent")}>
      <div className={clsx("flex justify-start items-center gap-2 px-1", !isOpponentBoard && "pb-1")}>
        <div className={isOpponentBoard ? "w-4 h-4" : "w-6 h-6"}>
          <UserAvatar
            user={user}
            className={isOpponentBoard ? "w-4 h-4" : "w-6 h-6"}
            size={isOpponentBoard ? 16 : 24}
          />
        </div>
        <p className={clsx("line-clamp-1", isOpponentBoard ? "text-sm" : "text-base")}>
          {user?.username}
          {seatNumber} ({score})
        </p>
      </div>
      <div
        className={clsx(
          "grid gap-2 w-full border-y-8 border-y-gray-300 bg-gray-300 select-none",
          isOpponentBoard
            ? "[grid-template-areas:'board-grid-container''board-grid-container']"
            : isReversed
              ? "[grid-template-areas:'board-grid-container_preview-piece''board-grid-container_power-bar']"
              : "[grid-template-areas:'preview-piece_board-grid-container''power-bar_board-grid-container']",
          isOpponentBoard ? "" : "grid-rows-[max-content_auto] grid-cols-[max-content_auto]",
          isReversed
            ? "border-s-2 border-s-gray-300 border-e-8 border-e-gray-300"
            : "border-s-8 border-s-gray-300 border-e-2 border-e-gray-300",
        )}
      >
        <div
          className={clsx(
            "[grid-area:board-grid-container] relative grid w-full text-neutral-200",
            isGameOver ? "bg-neutral-500" : "bg-neutral-100",
            isOpponentBoard
              ? "grid-rows-grid-container-opponent w-grid-container-opponent"
              : "grid-rows-grid-container w-grid-container",
            "before:content-[attr(data-seat-number)] before:absolute before:top-1/4 before:start-1/2 before:-translate-x-1/2 before:text-[7rem] before:font-bold before:text-center",
          )}
          data-seat-number={seatNumber}
          data-testid="player-board-grid-container"
        >
          {!isPlaying && (
            <div
              className={clsx(
                "absolute start-1/2 -translate-x-1/2 z-20 flex flex-col gap-2 shadow-md bg-neutral-800 text-center",
                isOpponentBoard
                  ? "top-[90%] -translate-y-[90%] px-1 py-2 w-full"
                  : "top-1/2 -translate-y-1/2 px-3 py-2 w-11/12",
              )}
            >
              {isSeated ? (
                <>
                  <Button className="w-full" tabIndex={seatNumber} onClick={() => handleSeatChange(null)}>
                    <Trans>Stand</Trans>
                  </Button>
                  <Button
                    className="w-full border-t-yellow-400 border-e-yellow-600 border-b-yellow-600 border-s-yellow-400 bg-yellow-500 font-medium"
                    tabIndex={seatNumber}
                    onClick={() => onReady(seatNumber)}
                  >
                    <Trans>Start</Trans>
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full border-t-yellow-400 border-e-yellow-600 border-b-yellow-600 border-s-yellow-400"
                  tabIndex={seatNumber}
                  onClick={() => handleSeatChange(seatNumber)}
                >
                  <Trans>Join</Trans>
                </Button>
              )}

              {user && user?.id !== session?.user.id && (
                <p
                  className={clsx(
                    "flex justify-center items-center text-neutral-50",
                    isOpponentBoard ? "h-8 text-[10px] line-clamp-2" : "h-16 text-lg",
                  )}
                >
                  <span>
                    <Trans>Waiting for more players</Trans>
                  </span>
                  {isReady && (
                    <span>
                      <Trans>Ready</Trans>
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
          <Grid board={board} isOpponentBoard={isOpponentBoard} />
        </div>
        {!isOpponentBoard && (
          <>
            <div
              className={clsx(
                "[grid-area:preview-piece] flex flex-col items-center justify-center h-preview-piece px-2 py-2 bg-neutral-100",
                isOpponentBoard ? "" : "w-preview-piece",
              )}
            >
              <NextPiece nextPiece={nextPieces[0]} />
            </div>
            <div
              className={clsx(
                "[grid-area:power-bar] flex flex-col items-center justify-end h-power-bar px-2 py-2 bg-neutral-100",
                isOpponentBoard ? "" : "w-power-bar",
              )}
              data-testid="player-board-power-bar-container"
            >
              <PowerBar blocks={powerBar} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
