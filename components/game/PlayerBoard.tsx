"use client"

import { ReactNode } from "react"
import Image from "next/image"
import clsx from "clsx/lite"
import Grid from "@/components/game/Grid"
import NextPiece from "@/components/game/NextPiece"
import PowerBar from "@/components/game/PowerBar"
import Button from "@/components/ui/Button"
import { useTowers } from "@/hooks"
import styles from "./PlayerBoard.module.scss"

type PlayerBoardProps = {
  seatNumber: number
  isOpponentBoard?: boolean
  isReversed?: boolean
  isSeated?: boolean
  isSeatOccupied?: boolean
  onChooseSeat: (seatNumber: number | null) => void
}

export default function PlayerBoard(props: PlayerBoardProps): ReactNode {
  const { board, startGame, isPlaying, isGameOver, score, nextPieces, powerBar } = useTowers()

  const handleSeatChange = (seatNumber: number | null): void => {
    props.onChooseSeat(seatNumber)
  }

  return (
    <div className={clsx("flex flex-col", props.isOpponentBoard && "w-player-board-opponent")}>
      <div className="flex justify-start items-center gap-2 px-1">
        <Image
          className={clsx(props.isOpponentBoard ? "w-4 h-4" : "w-6 h-6")}
          src={`https://picsum.photos/${props.isOpponentBoard ? 16 : 24}`}
          width={props.isOpponentBoard ? 16 : 24}
          height={props.isOpponentBoard ? 16 : 24}
          alt=""
        />
        <p className={clsx("text-custom-neutral-100 line-clamp-1", props.isOpponentBoard ? "text-sm" : "text-base")}>
          the_player{props.seatNumber} ({score})
        </p>
      </div>
      <div
        className={clsx(
          "grid gap-2 w-full border-y-8 border-y-custom-blue-900 bg-custom-blue-900 select-none",
          props.isOpponentBoard
            ? "grid-areas-board-container-opponent"
            : props.isReversed
              ? "grid-areas-board-container-reversed"
              : "grid-areas-board-container",
          props.isOpponentBoard ? "" : "grid-rows-[max-content_auto] grid-cols-[max-content_auto]",
          props.isReversed
            ? "border-s-2 border-s-custom-blue-900 border-e-8 border-e-custom-blue-900"
            : "border-s-8 border-s-custom-blue-900 border-e-2 border-e-custom-blue-900"
        )}
      >
        <div
          className={clsx(
            "relative grid grid-in-grid-container w-full text-black",
            isGameOver ? "bg-black" : "bg-custom-neutral-200",
            props.isOpponentBoard
              ? "grid-rows-grid-container-opponent w-grid-container-opponent"
              : "grid-rows-grid-container w-grid-container",
            styles.BoardContainer
          )}
          data-seat-number={props.seatNumber}
        >
          {!isPlaying && (
            <div
              className={clsx(
                "absolute left-1/2 -translate-x-1/2 z-20 flex flex-col gap-2 shadow-md bg-black text-center",
                props.isOpponentBoard
                  ? "top-[90%] -translate-y-[90%] px-1 py-2 w-full"
                  : "top-1/2 -translate-y-1/2 px-3 py-2 w-11/12"
              )}
            >
              {props.isSeatOccupied ? (
                <p
                  className={clsx(
                    "flex justify-center items-center text-custom-blue-100",
                    props.isOpponentBoard ? "h-8 text-sm line-clamp-2" : "h-16 text-xl"
                  )}
                >
                  <span>Waiting for more players</span>
                  <span>Ready</span>
                </p>
              ) : (
                <>
                  {props.isSeated ? (
                    <>
                      <Button
                        isTableButton
                        className="w-full"
                        tabIndex={props.seatNumber}
                        onClick={() => handleSeatChange(null)}
                      >
                        Stand
                      </Button>
                      <Button
                        isTableButton
                        className="w-full border-t-yellow-400 border-e-yellow-600 border-b-yellow-600 border-s-yellow-400"
                        tabIndex={props.seatNumber}
                        onClick={startGame}
                      >
                        Start
                      </Button>
                    </>
                  ) : (
                    <Button
                      isTableButton
                      className="w-full border-t-yellow-400 border-e-yellow-600 border-b-yellow-600 border-s-yellow-400"
                      tabIndex={props.seatNumber}
                      onClick={() => handleSeatChange(props.seatNumber)}
                    >
                      Join
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
          <Grid board={board} isOpponentBoard={props.isOpponentBoard} />
        </div>
        {!props.isOpponentBoard && (
          <>
            <div
              className={clsx(
                "grid-in-preview-block flex flex-col items-center justify-center h-preview-block px-2 py-2 bg-custom-neutral-200",
                props.isOpponentBoard ? "" : "w-preview-block"
              )}
            >
              <NextPiece nextPiece={nextPieces[0]} />
            </div>
            <div
              className={clsx(
                "grid-in-power-bar flex flex-col items-center justify-end h-power-bar px-2 py-2 bg-custom-neutral-200",
                props.isOpponentBoard ? "" : "w-power-bar"
              )}
            >
              <PowerBar blocks={powerBar} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
