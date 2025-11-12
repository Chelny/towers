"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { GameState, PlayerListWithRelations, TowersPlayerControlKeys } from "db";
import PlayerInformationModal from "@/components/game/PlayerInformationModal";
import Grid from "@/components/towers/Grid";
import NextPiece from "@/components/towers/NextPiece";
import PowerBar from "@/components/towers/PowerBar";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/UserAvatar";
import { MIN_READY_TEAMS_COUNT } from "@/constants/game";
import { SocketEvents } from "@/constants/socket-events";
import { useModal } from "@/context/ModalContext";
import { useSocket } from "@/context/SocketContext";
import { ServerTowersSeat } from "@/data/table";
import { BlockToRemove, BoardPlainObject } from "@/server/towers/game/Board";
import { NextPiecesPlainObject } from "@/server/towers/game/NextPieces";
import { PiecePlainObject } from "@/server/towers/game/Piece";
import { PowerBarItemPlainObject, PowerBarPlainObject } from "@/server/towers/game/PowerBar";
import { TowersPieceBlockPlainObject } from "@/server/towers/game/TowersPieceBlock";
import { isTestMode } from "@/server/towers/utils/test";

type PlayerBoardProps = {
  tableId: string
  seat: ServerTowersSeat
  isOpponentBoard: boolean
  gameState?: GameState
  readyTeamsCount: number
  isSitAccessGranted: boolean
  isUserSeatedAnywhere: boolean
  isTablePlayerReady: boolean
  isTablePlayerPlaying: boolean
  isRatingsVisible: boolean
  onSit: (seatNumber: number) => void
  onStand: () => void
  onStart: () => void
  onNextPowerBarItem: (nextPowerBarItem?: PowerBarItemPlainObject) => void
}

const TYPING_TIMEOUT_MS = 3000;

export default function PlayerBoard({
  tableId,
  seat,
  isOpponentBoard,
  gameState,
  readyTeamsCount,
  isSitAccessGranted,
  isUserSeatedAnywhere,
  isTablePlayerReady: isReady,
  isTablePlayerPlaying: isPlaying,
  isRatingsVisible,
  onSit,
  onStand,
  onStart,
  onNextPowerBarItem,
}: PlayerBoardProps): ReactNode {
  const { socketRef, isConnected, session } = useSocket();
  const { openModal } = useModal();
  const [nextPieces, setNextPieces] = useState<NextPiecesPlainObject | null>(null);
  const [powerBar, setPowerBar] = useState<PowerBarPlainObject | null>(null);
  const [board, setBoard] = useState<BoardPlainObject | null>(null);
  const [currentPiece, setCurrentPiece] = useState<PiecePlainObject>();
  const boardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isCurrentUserSeat: boolean = seat.occupiedByPlayer?.id === session?.user?.id;
  const [controlKeys, setControlKeys] = useState<TowersPlayerControlKeys | null | undefined>(
    seat.occupiedByPlayer?.controlKeys,
  );
  const typedRef = useRef<string>("");
  const typingTimerRef = useRef<NodeJS.Timeout>(null);
  const isSeatAvailable: boolean =
    (gameState === GameState.WAITING && !seat.occupiedByPlayer && !isUserSeatedAnywhere) ||
    (gameState === GameState.PLAYING && !seat.occupiedByPlayer && !isUserSeatedAnywhere);
  const isCurrentUserSeated: boolean = isCurrentUserSeat && !isReady && !isPlaying;
  const isUserReady: boolean =
    gameState === GameState.WAITING &&
    isReady &&
    !isPlaying &&
    readyTeamsCount >= (isTestMode() ? 1 : MIN_READY_TEAMS_COUNT);
  const isUserWaitingForMorePlayers: boolean =
    gameState === GameState.WAITING &&
    isReady &&
    !isPlaying &&
    readyTeamsCount < (isTestMode() ? 1 : MIN_READY_TEAMS_COUNT);
  const isUserWaitingForNextGame: boolean = gameState === GameState.PLAYING && !!seat.occupiedByPlayer && !isPlaying;
  const [blocksToRemove, setBlocksToRemove] = useState<BlockToRemove[]>([]);

  useEffect(() => {
    setControlKeys(seat.occupiedByPlayer?.controlKeys);
    setBoard(seat.board);
    setNextPieces(seat.nextPieces);
    setPowerBar(seat.powerBar);
  }, [seat]);

  useEffect(() => {
    if (!controlKeys) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!isCurrentUserSeat || !isPlaying || board?.isGameOver) return;

      const keyMap: { [key: string]: () => void } = {
        [controlKeys.moveLeft]: () => handleMovePiece("left"),
        [controlKeys.moveRight]: () => handleMovePiece("right"),
        [controlKeys.cycleBlock]: handleCyclePiece,
        [controlKeys.dropPiece]: handleDropPiece,
        [controlKeys.useItem]: handleUsePowerItem,
        [controlKeys.useItemOnPlayer1]: () => handleUsePowerItem(1),
        [controlKeys.useItemOnPlayer2]: () => handleUsePowerItem(2),
        [controlKeys.useItemOnPlayer3]: () => handleUsePowerItem(3),
        [controlKeys.useItemOnPlayer4]: () => handleUsePowerItem(4),
        [controlKeys.useItemOnPlayer5]: () => handleUsePowerItem(5),
        [controlKeys.useItemOnPlayer6]: () => handleUsePowerItem(6),
        [controlKeys.useItemOnPlayer7]: () => handleUsePowerItem(7),
        [controlKeys.useItemOnPlayer8]: () => handleUsePowerItem(8),
      };

      keyMap[event.code]?.();
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (!isCurrentUserSeat || !isPlaying || board?.isGameOver) return;

      if (event.code === controlKeys.dropPiece) {
        handleStopDropPiece();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [controlKeys]);

  useEffect(() => {
    // Set focus on correct seat when game starts
    if (gameState === GameState.PLAYING) {
      const boardEl: HTMLDivElement | null = isCurrentUserSeat ? boardRefs.current[seat.seatNumber - 1] : null;
      boardEl?.focus();
    }
  }, [gameState, isCurrentUserSeat]);

  useEffect(() => {
    if (isCurrentUserSeat) {
      onNextPowerBarItem(powerBar?.nextItem);
    }
  }, [isCurrentUserSeat, nextPieces]);

  useEffect(() => {
    if (!socketRef.current) return;

    if (!isCurrentUserSeated) {
      typedRef.current = "";
      clearTimeout(typingTimerRef.current!);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      const key: string = event.key?.toUpperCase();

      if (!/^[A-Z0-9 ]$/.test(key)) return;

      const activeElement: Element | null = document.activeElement;

      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement instanceof HTMLElement && activeElement.isContentEditable))
      ) {
        return;
      }

      typedRef.current += key;

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      typingTimerRef.current = setTimeout(() => {
        typedRef.current = "";
      }, TYPING_TIMEOUT_MS);

      // TODO: Complete TABLE_TYPED_HERO_CODE logic
      // socketRef.current?.emit(SocketEvents.TABLE_TYPED_HERO_CODE, { roomId, tableId, code: typedRef.current });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      typedRef.current = "";
    };
  }, [isConnected, isCurrentUserSeated]);

  useEffect(() => {
    if (!socketRef.current || !tableId) return;

    const handleGameUpdate = ({
      seatNumber: incomingSeatNumber,
      nextPieces,
      powerBar,
      board,
      currentPiece,
    }: {
      seatNumber: number
      nextPieces: NextPiecesPlainObject
      powerBar: PowerBarPlainObject
      board: BoardPlainObject
      currentPiece: PiecePlainObject
    }): void => {
      // This board is tied to one seat only (props.seat), so if it's for this seat, update
      if (incomingSeatNumber !== seat.seatNumber) return;

      setBoard(board);

      // Only update current piece, next pieces, and power bar if it's the current player's board
      if (isCurrentUserSeat) {
        setNextPieces(nextPieces);
        setPowerBar(powerBar);
        setCurrentPiece(currentPiece);
      }
    };

    const handleHooSendBlocks = ({
      tableId: id,
      teamNumber,
      blocks,
    }: {
      tableId: string
      teamNumber: number
      blocks: TowersPieceBlockPlainObject[]
    }): void => {
      if (
        id === tableId &&
        isCurrentUserSeat &&
        typeof seat.seatNumber !== "undefined" &&
        isCurrentUserSeat &&
        teamNumber !== seat.teamNumber
      ) {
        socketRef.current?.emit(SocketEvents.GAME_HOO_ADD_BLOCKS, { tableId, teamNumber, blocks });
      }
    };

    const handleBlocksMarkedForRemoval = async ({
      seatNumber,
      blocks,
    }: {
      seatNumber: number
      blocks: BlockToRemove[]
    }) => {
      if (seatNumber !== seat.seatNumber) return;

      setBlocksToRemove(blocks);
      await new Promise<void>((resolve) => setTimeout(resolve, 190));
      setBlocksToRemove([]);

      socketRef.current?.emit(SocketEvents.GAME_CLIENT_BLOCKS_ANIMATION_DONE);
    };

    socketRef.current?.on(SocketEvents.GAME_UPDATE, handleGameUpdate);
    socketRef.current?.on(SocketEvents.GAME_HOO_SEND_BLOCKS, handleHooSendBlocks);
    socketRef.current?.on(SocketEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL, handleBlocksMarkedForRemoval);

    return () => {
      socketRef.current?.off(SocketEvents.GAME_UPDATE, handleGameUpdate);
      socketRef.current?.off(SocketEvents.GAME_HOO_SEND_BLOCKS, handleHooSendBlocks);
      socketRef.current?.off(SocketEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL, handleBlocksMarkedForRemoval);
    };
  }, [isConnected, tableId, seat]);

  const handlePlayerInformation = (player: PlayerListWithRelations): void => {
    openModal(PlayerInformationModal, { player, isRatingsVisible });
  };

  const handleMovePiece = (direction: "left" | "right"): void => {
    socketRef.current?.emit(SocketEvents.PIECE_MOVE, { tableId, seatNumber: seat.seatNumber, direction });
  };

  const handleCyclePiece = (): void => {
    socketRef.current?.emit(SocketEvents.PIECE_CYCLE, { tableId, seatNumber: seat.seatNumber });
  };

  const handleDropPiece = (): void => {
    socketRef.current?.emit(SocketEvents.PIECE_DROP, { tableId, seatNumber: seat.seatNumber });
  };

  const handleStopDropPiece = (): void => {
    socketRef.current?.emit(SocketEvents.PIECE_DROP_STOP, { tableId, seatNumber: seat.seatNumber });
  };

  const handleUsePowerItem = (targetSeatNumber?: number): void => {
    socketRef.current?.emit(SocketEvents.POWER_USE, { tableId, seatNumber: seat.seatNumber, targetSeatNumber });
  };

  return (
    <div className={clsx("flex flex-col", isOpponentBoard && "w-player-board-opponent-width")}>
      {/* User avatar + username */}
      <div
        className={clsx(
          "flex justify-start items-center gap-2 px-1 mx-1 cursor-pointer",
          !isOpponentBoard ? "w-[175px] h-6" : "h-4",
          !isOpponentBoard && seat.isReversed && "ms-2 me-13",
          !isOpponentBoard && !seat.isReversed && "ms-16",
        )}
        role="button"
        tabIndex={0}
        onDoubleClick={() => (seat.occupiedByPlayer ? handlePlayerInformation(seat.occupiedByPlayer) : undefined)}
      >
        {seat.occupiedByPlayer?.user && (
          <>
            <div className={clsx(isOpponentBoard ? "w-4 h-4" : "w-6 h-6")}>
              <UserAvatar
                user={seat.occupiedByPlayer?.user}
                dimensions={isOpponentBoard ? "w-4 h-4" : "w-6 h-6"}
                size={isOpponentBoard ? 16 : 24}
              />
            </div>
            <div
              className={clsx(
                "truncate",
                isOpponentBoard ? "text-sm" : "text-base",
                board?.isHooDetected && "text-red-500 dark:text-red-400",
              )}
            >
              {seat.occupiedByPlayer?.user.username}
            </div>
          </>
        )}
      </div>

      {/* Main board */}
      <div
        className={clsx(
          "grid gap-2 w-full border-y-8 border-y-gray-300 bg-gray-300 select-none",
          isOpponentBoard
            ? "[grid-template-areas:'board-grid-container''board-grid-container']"
            : seat.isReversed
              ? "[grid-template-areas:'board-grid-container_preview-piece''board-grid-container_power-bar']"
              : "[grid-template-areas:'preview-piece_board-grid-container''power-bar_board-grid-container']",
          isOpponentBoard ? "" : "grid-rows-[max-content_auto] grid-cols-[max-content_auto]",
          seat.isReversed
            ? "border-s-2 border-s-gray-300 border-e-8 border-e-gray-300"
            : "border-s-8 border-s-gray-300 border-e-2 border-e-gray-300",
          "dark:border-s-slate-600 dark:border-e-slate-600 dark:border-y-slate-600 dark:bg-slate-600",
        )}
        // className={clsx(
        //   "grid gap-1 [grid-template-areas:'board-grid-container_preview-piece''board-grid-container_power-bar'] grid-rows-[max-content_auto] grid-cols-[max-content_auto] select-none",
        // )}
      >
        <div
          ref={(element: HTMLDivElement | null) => {
            if (isCurrentUserSeat) {
              boardRefs.current[seat.seatNumber - 1] = element;
            }
          }}
          className={clsx(
            "[grid-area:board-grid-container] relative grid w-full text-neutral-200",
            board?.isGameOver ? "bg-neutral-700 dark:bg-neutral-900" : "bg-neutral-100 dark:bg-slate-800",
            isOpponentBoard
              ? "grid-rows-(--grid-rows-grid-container-opponent) w-grid-container-opponent-width"
              : "grid-rows-(--grid-rows-grid-container) w-grid-container-width",
            "before:content-[attr(data-seat-number)] before:absolute before:start-1/2 before:-translate-x-1/2 before:text-[7rem] before:font-bold before:text-center",
            "dark:before:text-slate-700",
          )}
          // className={clsx(
          //   "[grid-area:board-grid-container] relative grid grid-rows-(--grid-rows-grid-container) w-grid-container-width border border-gray-200 text-neutral-200",
          //   board?.isGameOver ? "bg-neutral-700" : "bg-gray-50",
          //   "before:content-[attr(data-demo)] before:absolute before:top-1/4 before:start-1/2 before:-translate-x-1/2 before:text-4xl before:font-bold before:text-center before:text-neutral-300",
          // )}
          tabIndex={0}
          data-seat-number={seat.targetNumber}
          // data-demo="Demo"
          data-testid="player-board_container_grid"
        >
          <div
            className={clsx(
              "absolute start-1/2 -translate-x-1/2 z-20 flex flex-col gap-2 text-center",
              isOpponentBoard
                ? "top-[90%] -translate-y-[90%] w-full px-1 py-2"
                : "top-1/2 -translate-y-1/2 w-11/12 p-2",
              ((gameState === GameState.WAITING && isSitAccessGranted && (isSeatAvailable || isCurrentUserSeated)) ||
                isUserReady ||
                isUserWaitingForMorePlayers ||
                isUserWaitingForNextGame) &&
                "shadow-md bg-neutral-800 dark:border dark:border-slate-600 dark:bg-slate-700",
            )}
          >
            {gameState === GameState.WAITING && isSitAccessGranted && (
              <>
                {isSeatAvailable && (
                  <Button
                    className={clsx(
                      "w-full border-t-yellow-400 border-e-yellow-600 border-b-yellow-600 border-s-yellow-400",
                      "dark:border-t-yellow-600 dark:border-e-yellow-800 dark:border-b-yellow-800 dark:border-s-yellow-600",
                    )}
                    tabIndex={seat.seatNumber}
                    onClick={() => onSit(seat.seatNumber)}
                  >
                    <Trans>Join</Trans>
                  </Button>
                )}
                {isCurrentUserSeated && (
                  <>
                    <Button className="w-full" tabIndex={seat.seatNumber} onClick={onStand}>
                      <Trans>Stand</Trans>
                    </Button>
                    <Button
                      className={clsx(
                        "w-full border-t-yellow-400 border-e-yellow-600 border-b-yellow-600 border-s-yellow-400 bg-yellow-500 font-medium",
                        "dark:border-t-yellow-600 dark:border-e-yellow-800 dark:border-b-yellow-800 dark:border-s-yellow-600 dark:bg-yellow-600",
                      )}
                      tabIndex={seat.seatNumber}
                      onClick={onStart}
                    >
                      <Trans>Start</Trans>
                    </Button>
                  </>
                )}
              </>
            )}

            {(isUserReady || isUserWaitingForMorePlayers || isUserWaitingForNextGame) && (
              <p
                className={clsx(
                  "flex justify-center items-center text-neutral-50 overflow-hidden",
                  isOpponentBoard
                    ? "h-9 text-board-button-opponent leading-default"
                    : "h-16 text-board-button leading-default",
                )}
              >
                {isUserReady && <Trans>Ready</Trans>}
                {isUserWaitingForMorePlayers && <Trans>Waiting for more players</Trans>}
                {isUserWaitingForNextGame && <Trans>Waiting for the next game</Trans>}
              </p>
            )}
          </div>

          <Grid
            isOpponentBoard={isOpponentBoard}
            board={board}
            currentPiece={isCurrentUserSeat ? currentPiece : undefined}
            blocksToRemove={blocksToRemove}
          />
        </div>

        {/* Next piece and power bar */}
        {!isOpponentBoard && (
          <>
            <div
              className={clsx(
                "[grid-area:preview-piece] flex flex-col items-center justify-center h-preview-piece-height px-2 py-2 bg-neutral-100",
                isOpponentBoard ? "" : "w-preview-piece-width",
                "dark:bg-slate-800",
              )}
              // className={clsx(
              //   "[grid-area:preview-piece] flex flex-col items-center justify-center h-preview-piece-height px-2 py-2 border border-gray-200 bg-gray-50",
              //   "w-preview-piece-width",
              // )}
            >
              {isCurrentUserSeat && <NextPiece nextPiece={nextPieces?.nextPiece} />}
            </div>
            <div
              className={clsx(
                "[grid-area:power-bar] flex flex-col items-center justify-end h-power-bar-height px-2 py-2 bg-neutral-100",
                isOpponentBoard ? "" : "w-power-bar-width",
                "dark:bg-slate-800",
              )}
              // className={clsx(
              //   "[grid-area:power-bar] flex flex-col items-center justify-end w-power-bar-width h-power-bar-height px-2 py-2 border border-gray-200 bg-gray-50",
              // )}
              data-testid="player-board_container_power-bar"
            >
              {isCurrentUserSeat && <PowerBar powerBar={powerBar} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
