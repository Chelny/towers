import { TableChatMessageType } from "db";
import type { PlayerState, Table } from "@/server/towers/models/Table";
import {
  BOARD_ROWS,
  HIDDEN_ROWS_COUNT,
  REMOVED_BLOCKS_COUNT_FOR_REMOVE_POWERS,
  REMOVED_BLOCKS_COUNT_FOR_REMOVE_STONES,
  REMOVED_BLOCKS_COUNT_FOR_SPEED_DROP,
} from "@/constants/game";
import { RedisEvents, SocketEvents } from "@/constants/socket-events";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { publishRedisEvent } from "@/server/redis/publish";
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
import { Player } from "@/server/towers/models/Player";
import { TableSeat } from "@/server/towers/models/TableSeat";
import { isMedusaPiece, isMidasPiece } from "@/server/towers/utils/piece-type-check";

enum TickSpeed {
  NORMAL = 438, // 469 excluding the 00:00
  DROP = TickSpeed.NORMAL / 6,
  SPEED_DROP = TickSpeed.NORMAL / 5,
  BREAKING_BLOCKS = 100,
}

/**
 * Represents the game logic and state for a single player in a Towers match.
 *
 * Handles player input, active piece movement, power usage, and game loop logic.
 */
export class PlayerTowersGame {
  public player: Player;
  private table: Table;
  private currentPiece: Piece;
  private powerManager: PowerManager;
  private isSpecialSpeedDropActivated: boolean = false;
  private gameLoopIntervalId: NodeJS.Timeout | null = null;
  private tickSpeed: TickSpeed = TickSpeed.NORMAL;
  private isTickInProgress: boolean = false;
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

  constructor(player: Player, table: Table) {
    this.player = player;
    this.table = table;
    this.currentPiece = new TowersPiece();
    this.powerManager = new PowerManager(player, table);
    this.registerSocketListeners();
  }

  private registerSocketListeners(): void {
    this.player.subscribe(SocketEvents.PIECE_MOVE, this.onMovePiece);
    this.player.subscribe(SocketEvents.PIECE_CYCLE, this.onCyclePiece);
    this.player.subscribe(SocketEvents.PIECE_DROP, this.onDropPiece);
    this.player.subscribe(SocketEvents.PIECE_DROP_STOP, this.onStopDropPiece);
    this.player.subscribe(SocketEvents.POWER_USE, this.onUsePower);
    this.player.subscribe(SocketEvents.PIECE_SPEED, this.onSpecialSpeedDrop);
    this.player.subscribe(SocketEvents.GAME_HOO_ADD_BLOCKS, this.onAddHooBlocks);

    this.player.subscribe("disconnect", () => {
      this.cleanupSocketListeners();
    });
  }

  private cleanupSocketListeners(): void {
    this.player.unsubscribe(SocketEvents.PIECE_MOVE, this.onMovePiece);
    this.player.unsubscribe(SocketEvents.PIECE_CYCLE, this.onCyclePiece);
    this.player.unsubscribe(SocketEvents.PIECE_DROP, this.onDropPiece);
    this.player.unsubscribe(SocketEvents.PIECE_DROP_STOP, this.onStopDropPiece);
    this.player.unsubscribe(SocketEvents.POWER_USE, this.onUsePower);
    this.player.unsubscribe(SocketEvents.PIECE_SPEED, this.onSpecialSpeedDrop);
    this.player.unsubscribe(SocketEvents.GAME_HOO_ADD_BLOCKS, this.onAddHooBlocks);
  }

  private getValidSeatForAction(tableId: string, seatNumber: number): TableSeat | null {
    if (this.table.id !== tableId) return null;

    const seat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);
    if (!seat || seat.seatNumber !== seatNumber) return null;
    if (!this.table.isPlayerPlaying(this.player)) return null;

    return seat;
  }

  private handleMovePiece({
    tableId,
    seatNumber,
    direction,
  }: {
    tableId: string
    seatNumber: number
    direction: "left" | "right"
  }): void {
    if (!this.getValidSeatForAction(tableId, seatNumber)) return;
    direction === "left" ? this.movePieceLeft() : this.movePieceRight();
  }

  private handleCyclePiece({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (!this.getValidSeatForAction(tableId, seatNumber)) return;
    this.cyclePieceBlocks();
  }

  private handleDropPiece({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (!this.getValidSeatForAction(tableId, seatNumber)) return;
    this.movePieceDown();
  }

  private handleStopDropPiece({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (!this.getValidSeatForAction(tableId, seatNumber)) return;
    this.stopMovingPieceDown();
  }

  private handleUsePower({
    tableId,
    seatNumber,
    targetSeatNumber,
  }: {
    tableId: string
    seatNumber: number
    targetSeatNumber?: number
  }): void {
    if (!this.getValidSeatForAction(tableId, seatNumber)) return;
    this.usePower(targetSeatNumber);
  }

  private handleSpecialSpeedDrop({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (!this.getValidSeatForAction(tableId, seatNumber)) return;
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
    if (this.table.id !== tableId || !blocks || blocks.length === 0) return;

    const seat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);
    if (!seat || seat.seatNumber < 0) return;

    const board: Board | null = seat?.board;
    if (!seat || !board) return;

    const isPartner: boolean = seat.teamNumber === teamNumber;

    // Only place blocks if it's an enemy and the game isn't over
    if (!isPartner && this.table.isPlayerPlaying(this.player) && !board.isGameOver) {
      board.placeBlocksFromHoo(blocks.map((block: TowersPieceBlockPlainObject) => TowersPieceBlock.fromJSON(block)));
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

  private updateTickSpeed(newSpeed: TickSpeed): void {
    if (this.tickSpeed !== newSpeed) {
      this.tickSpeed = newSpeed;

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
    this.cleanupSocketListeners();

    this.sendGameStateToClient();
  }

  /**
   * Current piece falling on the board
   */
  private async tickFallPiece(): Promise<void> {
    if (this.isTickInProgress) return;
    this.isTickInProgress = true;

    const seat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);
    const nextPieces: NextPieces | null | undefined = seat?.nextPieces;
    const board: Board | null | undefined = seat?.board;

    if (!seat || !nextPieces || !board) {
      this.isTickInProgress = false;
      return;
    }

    const newPosition: PieceBlockPosition = {
      row: this.currentPiece.position.row + 1,
      col: this.currentPiece.position.col,
    };
    const simulatedPiece: Piece = Piece.simulateAtPosition(this.currentPiece, newPosition);

    if (board.hasCollision(simulatedPiece)) {
      await this.lockPieceInPlace();

      if (board.checkIfGameOver(this.currentPiece)) {
        const playerState: PlayerState | undefined = this.table.playersState.get(this.player.id);
        if (playerState) {
          playerState.isPlaying = false;
        }
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

    this.isTickInProgress = false;
  }

  /**
   * Lock the piece to the board and gets the next one.
   */
  private async lockPieceInPlace(): Promise<void> {
    const seat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);
    const board: Board | null | undefined = seat?.board;

    if (!seat || !board) return;

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
    await board.processLandedPiece(async (board, blocksToRemove) => {
      await this.waitForClientToFade(board, blocksToRemove);
    });

    if (board.isHooDetected) {
      this.sendCipherKey();
    }

    // Send removed blocks while hoo is detected to opponents
    if (board.removedBlocksFromHoo.length > 0) {
      await publishRedisEvent(RedisEvents.GAME_HOO_SEND_BLOCKS, {
        tableId: this.table.id,
        teamNumber: seat.teamNumber,
        blocks: board.removedBlocksFromHoo.map((block: TowersPieceBlock) =>
          new TowersPieceBlock(block.letter as TowersBlockLetter, block.position).toPlainObject(),
        ),
      });

      board.removedBlocksFromHoo = [];
    }

    this.addSpecialDiamondsToPowerBar();

    // Force emit partner grid too when it's game over for them
    if (board.partnerBoard && board.partnerBoard.isGameOver) {
      const partnerSeat: TableSeat | undefined = this.table.findSeatByBoard(board.partnerBoard);

      if (partnerSeat) {
        await publishRedisEvent(RedisEvents.GAME_UPDATE, {
          tableId: this.table.id,
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
    const seat: TableSeat | undefined = this.table.findSeatByBoard(board);
    if (!seat) return;

    await publishRedisEvent(RedisEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL, {
      tableId: this.table.id,
      seatNumber: seat.seatNumber,
      blocks: blocksToRemove,
    });

    await new Promise<void>((resolve) => {
      const onceListener = (): void => {
        // Remove listener from all sockets after first call
        for (const socket of this.player.sockets) {
          socket.off(SocketEvents.GAME_CLIENT_BLOCKS_ANIMATION_DONE, onceListener);
        }
        resolve();
      };

      for (const socket of this.player.sockets) {
        socket.once(SocketEvents.GAME_CLIENT_BLOCKS_ANIMATION_DONE, onceListener);
      }
    });
  }

  /**
   * Add special diamonds to the power block based on the total number of broken blocks.
   */
  private addSpecialDiamondsToPowerBar(): void {
    const seat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);
    const powerBar: PowerBar | null | undefined = seat?.powerBar;
    const board: Board | null | undefined = seat?.board;

    if (!seat || !powerBar || !board) return;

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
    const seat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);
    const board: Board | null | undefined = seat?.board;

    if (!seat || !board) return;

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
    const seat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);
    const board: Board | null | undefined = seat?.board;

    if (!seat || !board) return;

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
    this.isSpecialSpeedDropActivated = true;
    this.updateTickSpeed(TickSpeed.SPEED_DROP);
  }

  public removeSpecialSpeedDrop(): void {
    this.isSpecialSpeedDropActivated = false;
    this.updateTickSpeed(TickSpeed.NORMAL);
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
  private async sendCipherKey(): Promise<void> {
    const cipherKey: CipherKey | null = CipherHeroManager.getCipherKey(this.player.id);

    if (cipherKey) {
      await prisma.towersTableChatMessage.create({
        data: {
          tableId: this.table.id,
          playerId: this.player.id,
          type: TableChatMessageType.CIPHER_KEY,
          textVariables: { encryptedChar: cipherKey.encryptedChar, decryptedChar: cipherKey.decryptedChar },
          visibleToUserId: this.player.id,
        },
      });
    }
  }

  private async sendGameStateToClient(): Promise<void> {
    const tableSeat: TableSeat | undefined = this.table.findSeatByPlayer(this.player);

    await publishRedisEvent(RedisEvents.GAME_UPDATE, {
      tableId: this.table.id,
      seatNumber: tableSeat?.seatNumber,
      nextPieces: tableSeat?.nextPieces?.toPlainObject(),
      powerBar: tableSeat?.powerBar?.toPlainObject(),
      board: tableSeat?.board?.toPlainObject(),
      currentPiece: this.currentPiece.toPlainObject(),
    });
  }
}
