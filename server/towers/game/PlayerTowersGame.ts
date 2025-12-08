import { TableChatMessageType } from "db";
import { DisconnectReason, Socket } from "socket.io";
import {
  BLOCK_BREAK_ANIMATION_DURATION_MS,
  BOARD_ROWS,
  HIDDEN_ROWS_COUNT,
  REMOVED_BLOCKS_COUNT_FOR_REMOVE_POWERS,
  REMOVED_BLOCKS_COUNT_FOR_REMOVE_STONES,
  REMOVED_BLOCKS_COUNT_FOR_SPEED_DROP,
} from "@/constants/game";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { ServerInternalEvents } from "@/constants/socket/server-internal";
import { logger } from "@/lib/logger";
import { publishRedisEvent } from "@/server/redis/publish";
import { SocketEventBinder } from "@/server/socket/SocketEventBinder";
import { TablePlayer } from "@/server/towers/classes/TablePlayer";
import { TableSeat } from "@/server/towers/classes/TableSeat";
import { BlockToRemove, Board } from "@/server/towers/game/Board";
import { CipherHeroManager, CipherKey } from "@/server/towers/game/CipherHeroManager";
import { NextPieces } from "@/server/towers/game/NextPieces";
import { Piece } from "@/server/towers/game/Piece";
import { PieceBlock, PieceBlockPosition, TowersBlockLetter } from "@/server/towers/game/PieceBlock";
import { PowerBar } from "@/server/towers/game/PowerBar";
import { PowerManager } from "@/server/towers/game/PowerManager";
import { SpecialDiamond } from "@/server/towers/game/SpecialDiamond";
import { TowersPiece } from "@/server/towers/game/TowersPiece";
import { TowersPieceBlock, TowersPieceBlockPlainObject } from "@/server/towers/game/TowersPieceBlock";
import { TableChatMessageManager } from "@/server/towers/managers/TableChatMessageManager";
import { TablePlayerManager } from "@/server/towers/managers/TablePlayerManager";
import { TableSeatManager } from "@/server/towers/managers/TableSeatManager";
import { isMedusaPiece, isMidasPiece } from "@/server/towers/utils/piece-type-check";

enum TickSpeed {
  NORMAL = 438, // 469 excluding the 00:00
  DROP = TickSpeed.NORMAL / 6,
  SPEED_DROP = TickSpeed.NORMAL / 5,
  BREAKING_BLOCKS = 100,
}

/**
 * Represents the game logic and state for a single player in a Towers game.
 *
 * Handles player input, active piece movement, power usage, and game loop logic.
 */
export class PlayerTowersGame {
  public tableId: string;
  public players: TablePlayer[];
  public tablePlayer: TablePlayer;
  private currentPiece: Piece;
  private powerManager: PowerManager;
  private isSpecialSpeedDropActivated: boolean = false;
  private gameLoopIntervalId: NodeJS.Timeout | null = null;
  private tickSpeed: TickSpeed = TickSpeed.NORMAL;
  private isTickInProgress: boolean = false;
  private isPieceLocked: boolean = false;
  private eventBinder: SocketEventBinder | null = null;
  private onMovePiece: (data: { tableId: string; seatNumber: number; direction: "left" | "right" }) => void =
    this.handleMovePiece.bind(this);
  private onCyclePiece: (data: { tableId: string; seatNumber: number }) => void = this.handleCyclePiece.bind(this);
  private onDropPiece: (data: { tableId: string; seatNumber: number }) => void = this.handleDropPiece.bind(this);
  private onStopDropPiece: (data: { tableId: string; seatNumber: number }) => void = this.handleStopDropPiece.bind(this);
  private onUsePower: (data: { tableId: string; seatNumber: number; targetSeatNumber?: number }) => void =
    this.handleUsePower.bind(this);
  private onSpecialSpeedDrop: (data: { tableId: string; seatNumber: number }) => void =
    this.handleSpecialSpeedDrop.bind(this);
  private onAddHooBlocks: (data: {
    tableId: string
    teamNumber: number
    blocks: TowersPieceBlockPlainObject[]
  }) => void = this.handleAddHooBlocks.bind(this);

  constructor(tableId: string, players: TablePlayer[], tablePlayer: TablePlayer) {
    this.tableId = tableId;
    this.players = players;
    this.tablePlayer = tablePlayer;
    this.currentPiece = new TowersPiece();
    this.powerManager = new PowerManager(tableId, players, tablePlayer);
    this.registerSocketListeners();
  }

  private registerSocketListeners(): void {
    const socket: Socket | null = this.tablePlayer.player.user.socket;
    if (!socket) return;

    this.eventBinder = new SocketEventBinder(socket);

    this.eventBinder.bind(ClientToServerEvents.PIECE_MOVE, this.onMovePiece);
    this.eventBinder.bind(ClientToServerEvents.PIECE_CYCLE, this.onCyclePiece);
    this.eventBinder.bind(ClientToServerEvents.PIECE_DROP, this.onDropPiece);
    this.eventBinder.bind(ClientToServerEvents.PIECE_DROP_STOP, this.onStopDropPiece);
    this.eventBinder.bind(ClientToServerEvents.POWER_USE, this.onUsePower);
    this.eventBinder.bind(ClientToServerEvents.PIECE_SPEED, this.onSpecialSpeedDrop);
    this.eventBinder.bind(ClientToServerEvents.GAME_HOO_ADD_BLOCKS, this.onAddHooBlocks);

    socket.on("disconnect", (reason: DisconnectReason) => {
      const shouldCleanup: boolean =
        reason === "forced close" ||
        reason === "server shutting down" ||
        reason === "forced server close" ||
        reason === "client namespace disconnect" ||
        reason === "server namespace disconnect";

      if (shouldCleanup) {
        this.eventBinder?.unbindAll();
        this.eventBinder = null;
      }
    });
  }

  private handleMovePiece({ direction }: { direction: "left" | "right" }): void {
    if (this.ignoreInput()) return;

    switch (direction) {
      case "left":
        this.movePieceLeft();
        break;
      case "right":
        this.movePieceRight();
        break;
      default:
        break;
    }
  }

  private handleCyclePiece(): void {
    if (this.ignoreInput()) return;
    this.cyclePieceBlocks();
  }

  private handleDropPiece(): void {
    if (this.ignoreInput()) return;
    this.movePieceDown();
  }

  private handleStopDropPiece(): void {
    if (this.ignoreInput()) return;
    this.stopMovingPieceDown();
  }

  private handleUsePower({ targetSeatNumber }: { targetSeatNumber?: number }): void {
    if (this.ignoreInput()) return;
    this.usePower(targetSeatNumber);
  }

  private handleSpecialSpeedDrop(): void {
    if (this.ignoreInput()) return;
    this.applySpecialSpeedDrop();
  }

  private handleAddHooBlocks({
    tableId,
    teamNumber,
    blocks,
  }: {
    tableId: string
    teamNumber: number
    blocks: TowersPieceBlockPlainObject[]
  }): void {
    if (this.tableId !== tableId || !blocks || blocks.length === 0 || this.isPieceLocked) {
      return;
    }

    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, this.tablePlayer.playerId);
    const board: Board | null | undefined = tableSeat?.board;
    if (!tableSeat || !board) return;

    const isPartner: boolean = tableSeat.teamNumber === teamNumber;

    if (tableSeat.seatNumber && !isPartner && this.tablePlayer.isPlaying && !board?.isGameOver) {
      board.placeBlocksFromHoo(
        blocks.map((block: TowersPieceBlockPlainObject) => TowersPieceBlock.fromPlainObject(block)),
      );
    }
  }

  public startGameLoop(): void {
    this.tick();
  }

  private tick(): void {
    this.clearGameLoop();

    this.gameLoopIntervalId = setInterval(() => {
      this.tickFallPiece();
    }, this.tickSpeed);
  }

  private updateTickSpeed(speed: TickSpeed): void {
    if (this.tickSpeed !== speed) {
      this.tickSpeed = speed;

      if (this.gameLoopIntervalId !== null) {
        this.tick();
      }
    }
  }

  private clearGameLoop(): void {
    if (this.gameLoopIntervalId) {
      clearInterval(this.gameLoopIntervalId);
      this.gameLoopIntervalId = null;
    }
  }

  public stopGameLoop(): void {
    // Hide falling piece from board
    if (this.currentPiece.position.row >= HIDDEN_ROWS_COUNT) {
      this.currentPiece.position = { ...this.currentPiece.position, row: BOARD_ROWS + 1 };
    }

    this.clearGameLoop();

    this.eventBinder?.unbindAll();
    this.eventBinder = null;

    this.sendGameStateToClient();
  }

  /**
   * Current piece falling on the board
   */
  private async tickFallPiece(): Promise<void> {
    if (this.isTickInProgress) return;
    this.isTickInProgress = true;

    try {
      const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(
        this.tableId,
        this.tablePlayer.playerId,
      );
      const nextPieces: NextPieces | null | undefined = tableSeat?.nextPieces;
      const board: Board | null | undefined = tableSeat?.board;

      if (!tableSeat || !nextPieces || !board) {
        this.isTickInProgress = false;
        return;
      }

      const newPosition: PieceBlockPosition = {
        row: this.currentPiece.position.row + 1,
        col: this.currentPiece.position.col,
      };
      const simulatedPiece: Piece = Piece.simulateAtPosition(this.currentPiece, newPosition);

      if (board.hasCollision(simulatedPiece)) {
        this.isPieceLocked = true;
        this.updateTickSpeed(TickSpeed.BREAKING_BLOCKS);

        await this.lockPieceInPlace();

        if (board.checkIfGameOver(this.currentPiece)) {
          this.tablePlayer.isPlaying = false;
          await TablePlayerManager.upsert(this.tablePlayer);
          this.stopGameLoop();
          return;
        }

        // Generate next piece
        this.currentPiece = nextPieces.getNextPiece();
        logger.debug(
          `New piece generated: ${JSON.stringify(this.currentPiece.blocks.map((block: PieceBlock) => block.letter))}`,
        );

        if (this.isSpecialSpeedDropActivated) {
          this.removeSpecialSpeedDrop();
        }

        this.sendGameStateToClient();
      } else {
        this.currentPiece.position = newPosition;
        this.sendGameStateToClient();
      }
    } finally {
      this.isTickInProgress = false;
    }
  }

  /**
   * Lock the piece to the board and gets the next one.
   */
  private async lockPieceInPlace(): Promise<void> {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, this.tablePlayer.playerId);
    const board: Board | null | undefined = tableSeat?.board;
    if (!tableSeat || !board) return;

    if (!this.isPieceLocked) {
      this.isPieceLocked = true;
      this.updateTickSpeed(TickSpeed.BREAKING_BLOCKS);
    }

    board.placePiece(this.currentPiece);
    logger.debug(
      `Piece committed to the board at position X=${this.currentPiece.position.col}, Y=${this.currentPiece.position.row}`,
    );

    // Apply piece effects (power blocks)
    if (isMedusaPiece(this.currentPiece) || isMidasPiece(this.currentPiece)) {
      await board.convertSurroundingBlocksToPowerBlocks(this.currentPiece);
      this.sendGameStateToClient();
    }

    // Run all recursive block-breaking logic
    await board.processLandedPiece(async (board: Board, blocksToRemove: BlockToRemove[]) => {
      await this.waitForClientToFade(board, blocksToRemove);
    });

    if (board.isHooDetected) {
      this.sendCipherKey();
    }

    // Send removed blocks while hoo is detected to opponents
    if (board.removedBlocksFromHoo.length > 0) {
      await publishRedisEvent(ServerInternalEvents.GAME_HOO_SEND_BLOCKS, {
        tableId: this.tableId,
        teamNumber: tableSeat.teamNumber,
        blocks: board.removedBlocksFromHoo.map((block: TowersPieceBlock) =>
          new TowersPieceBlock(block.letter as TowersBlockLetter, block.position).toPlainObject(),
        ),
      });

      board.removedBlocksFromHoo = [];
    }

    this.addSpecialDiamondsToPowerBar();

    this.updateTickSpeed(TickSpeed.NORMAL);
    this.isPieceLocked = false;

    // Force emit partner grid too when it's game over for them
    if (board.partnerBoard && board.partnerBoard.isGameOver) {
      const partnerSeat: TableSeat | undefined = TableSeatManager.getSeatByBoard(this.tableId, board.partnerBoard);

      if (partnerSeat) {
        await publishRedisEvent(ServerInternalEvents.GAME_UPDATE, {
          tableId: this.tableId,
          seatNumber: partnerSeat.seatNumber,
          nextPieces: partnerSeat.nextPieces?.toPlainObject(),
          powerBar: partnerSeat.powerBar?.toPlainObject(),
          board: board.partnerBoard.toPlainObject(),
          currentPiece: null,
        });
      }
    }
  }

  private async waitForClientToFade(board: Board, blocksToRemove: BlockToRemove[]) {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByBoard(this.tableId, board);
    if (!tableSeat) return;

    await publishRedisEvent(ServerInternalEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL, {
      tableId: tableSeat.tableId,
      seatNumber: tableSeat.seatNumber,
      blocks: blocksToRemove,
    });

    const socket: Socket | null = this.tablePlayer.player.user.socket;
    if (!socket) return;

    // Wait for client animation event, fallback to short timeout
    await new Promise<void>((resolve) => {
      let isResolved: boolean = false;

      const onDone = (): void => {
        if (!isResolved) {
          isResolved = true;
          socket.off(ClientToServerEvents.GAME_CLIENT_BLOCKS_ANIMATION_DONE, onDone);
          clearTimeout(timeoutId);
          resolve();
        }
      };

      socket.once(ClientToServerEvents.GAME_CLIENT_BLOCKS_ANIMATION_DONE, onDone);
      const timeoutId: NodeJS.Timeout = setTimeout(onDone, BLOCK_BREAK_ANIMATION_DURATION_MS);
    });
  }

  /**
   * Add special diamonds to the power block based on the total number of broken blocks.
   */
  private addSpecialDiamondsToPowerBar(): void {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, this.tablePlayer.playerId);
    const powerBar: PowerBar | null | undefined = tableSeat?.powerBar;
    const board: Board | null | undefined = tableSeat?.board;

    if (!tableSeat || !powerBar || !board) return;

    if (board.removedBlocksCount >= REMOVED_BLOCKS_COUNT_FOR_SPEED_DROP && !board.isSpeedDropUnlocked) {
      powerBar.addItem(new SpecialDiamond("speed drop"));
      board.isSpeedDropUnlocked = true;
    }

    if (board.removedBlocksCount >= REMOVED_BLOCKS_COUNT_FOR_REMOVE_POWERS && !board.isRemovePowersUnlocked) {
      powerBar.addItem(new SpecialDiamond("remove powers"));
      board.isRemovePowersUnlocked = true;
    }

    if (board.removedBlocksCount >= REMOVED_BLOCKS_COUNT_FOR_REMOVE_STONES && !board.isRemoveStonesUnlocked) {
      powerBar.addItem(new SpecialDiamond("remove stones"));
      board.isRemoveStonesUnlocked = true;
    }
  }

  /**
   * Moves the current piece to the left.
   */
  private movePieceLeft(): void {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, this.tablePlayer.playerId);
    const board: Board | null | undefined = tableSeat?.board;

    if (!tableSeat || !board) return;

    const newPosition: PieceBlockPosition = {
      row: this.currentPiece.position.row,
      col: this.currentPiece.position.col - 1,
    };
    const simulatedPiece: Piece = Piece.simulateAtPosition(this.currentPiece, newPosition);

    if (!board.hasCollision(simulatedPiece)) {
      this.currentPiece.position = newPosition;
      logger.debug("Moved piece left");
      this.sendGameStateToClient();
    }
  }

  /**
   * Moves the current piece to the right.
   */
  private movePieceRight(): void {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, this.tablePlayer.playerId);
    const board: Board | null | undefined = tableSeat?.board;

    if (!tableSeat || !board) return;

    const newPosition: PieceBlockPosition = {
      row: this.currentPiece.position.row,
      col: this.currentPiece.position.col + 1,
    };
    const simulatedPiece: Piece = Piece.simulateAtPosition(this.currentPiece, newPosition);

    if (!board.hasCollision(simulatedPiece)) {
      this.currentPiece.position = newPosition;
      logger.debug("Moved piece right");
      this.sendGameStateToClient();
    }
  }

  /**
   * Cycles the piece blocks up.
   */
  private cyclePieceBlocks(): void {
    this.currentPiece.cycleBlocks();
    logger.debug("Cycle piece blocks");
    this.sendGameStateToClient();
  }

  /**
   * Increases the piece drop speed.
   */
  private movePieceDown(): void {
    if (this.isSpecialSpeedDropActivated) return;

    this.updateTickSpeed(TickSpeed.DROP);
    logger.debug(`Increased piece drop speed to ${this.tickSpeed}ms.`);

    this.sendGameStateToClient();
  }

  /**
   * Stops the piece from moving down fast.
   */
  private stopMovingPieceDown(): void {
    if (this.isSpecialSpeedDropActivated) return;

    this.updateTickSpeed(TickSpeed.NORMAL);
    logger.debug(`Reset piece drop speed to ${this.tickSpeed}ms.`);

    this.sendGameStateToClient();
  }

  /**
   * Use a power from the power bar.
   * @param targetSeatNumber - Optional. The seat number to target.
   */
  public usePower(targetSeatNumber?: number): void {
    this.powerManager.usePower(targetSeatNumber);
    this.sendGameStateToClient();
  }

  public applySpecialSpeedDrop(): void {
    if (!this.isSpecialSpeedDropActivated) {
      this.isSpecialSpeedDropActivated = true;
      this.updateTickSpeed(TickSpeed.SPEED_DROP);
    }
  }

  public removeSpecialSpeedDrop(): void {
    if (this.isSpecialSpeedDropActivated) {
      this.isSpecialSpeedDropActivated = false;
      this.updateTickSpeed(TickSpeed.NORMAL);
    }
  }

  private ignoreInput(): boolean {
    return !this.tablePlayer.isPlaying || this.isPieceLocked;
  }

  /**
   * Generates and sends a cipher key to the current player if one is available.
   *
   * This method attempts to generate a new `CipherKey` for the user via the `CipherHeroManager`.
   * If a key is awarded, it emits a `CIPHER_KEY` chat message visible only to the recipient.
   * This message contains the encrypted and decrypted character pair.
   *
   * Typical use case: reward system after gameplay milestones (e.g., clearing lines, surviving a turn, etc.).
   */
  private sendCipherKey(): void {
    const cipherKey: CipherKey | null = CipherHeroManager.getCipherKey(this.tablePlayer.playerId);

    if (cipherKey) {
      TableChatMessageManager.create({
        tableId: this.tableId,
        player: this.tablePlayer.player,
        text: null,
        type: TableChatMessageType.CIPHER_KEY,
        textVariables: { encryptedChar: cipherKey.encryptedChar, decryptedChar: cipherKey.decryptedChar },
        visibleToUserId: this.tablePlayer.playerId,
      });
    }
  }

  private async sendGameStateToClient(): Promise<void> {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, this.tablePlayer.playerId);

    await publishRedisEvent(ServerInternalEvents.GAME_UPDATE, {
      tableId: this.tableId,
      seatNumber: tableSeat?.seatNumber,
      nextPieces: tableSeat?.nextPieces?.toPlainObject(),
      powerBar: tableSeat?.powerBar?.toPlainObject(),
      board: tableSeat?.board?.toPlainObject(),
      currentPiece: this.currentPiece.toPlainObject(),
    });
  }
}
