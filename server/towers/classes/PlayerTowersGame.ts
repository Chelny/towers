import { DisconnectReason } from "socket.io"
import {
  BOARD_ROWS,
  HIDDEN_ROWS_COUNT,
  REMOVED_BLOCKS_COUNT_FOR_REMOVE_POWERS,
  REMOVED_BLOCKS_COUNT_FOR_REMOVE_STONES,
  REMOVED_BLOCKS_COUNT_FOR_SPEED_DROP,
} from "@/constants/game"
import { SocketEvents } from "@/constants/socket-events"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { logger } from "@/lib/logger"
import { BlockToRemove, Board } from "@/server/towers/classes/Board"
import { CipherHeroManager, CipherKey } from "@/server/towers/classes/CipherHeroManager"
import { NextPieces } from "@/server/towers/classes/NextPieces"
import { Piece } from "@/server/towers/classes/Piece"
import { PieceBlock, PieceBlockPosition, TowersBlockLetter } from "@/server/towers/classes/PieceBlock"
import { PowerBar } from "@/server/towers/classes/PowerBar"
import { PowerManager } from "@/server/towers/classes/PowerManager"
import { SpecialDiamond } from "@/server/towers/classes/SpecialDiamond"
import { TableChat } from "@/server/towers/classes/TableChat"
import { TableSeat } from "@/server/towers/classes/TableSeat"
import { TableSeatManager } from "@/server/towers/classes/TableSeatManager"
import { TowersPiece } from "@/server/towers/classes/TowersPiece"
import { TowersPieceBlock, TowersPieceBlockPlainObject } from "@/server/towers/classes/TowersPieceBlock"
import { User } from "@/server/towers/classes/User"
import { isMedusaPiece, isMidasPiece } from "@/server/towers/utils/piece-type-check"

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
  public user: User
  private tableId: string
  private chat: TableChat
  private tableSeatManager: TableSeatManager
  private currentPiece: Piece
  private powerManager: PowerManager
  private isSpecialSpeedDropActivated: boolean = false
  private gameLoopIntervalId: NodeJS.Timeout | null = null
  private tickSpeed: TickSpeed = TickSpeed.NORMAL
  private isTickInProgress: boolean = false
  private onMovePiece: (data: { tableId: string; seatNumber: number; direction: "left" | "right" }) => void =
    this.handleMovePiece.bind(this)
  private onCyclePiece: (data: { tableId: string; seatNumber: number }) => void = this.handleCyclePiece.bind(this)
  private onDropPiece: (data: { tableId: string; seatNumber: number }) => void = this.handleDropPiece.bind(this)
  private onStopDropPiece: (data: { tableId: string; seatNumber: number }) => void = this.handleStopDropPiece.bind(this)
  private onUsePower: (data: { tableId: string; seatNumber: number; targetSeatNumber?: number }) => void =
    this.handleUsePower.bind(this)
  private onSpecialSpeedDrop: (data: { tableId: string; seatNumber: number }) => void =
    this.handleSpecialSpeedDrop.bind(this)
  private onAddHooBlocks: (data: {
    tableId: string
    teamNumber: number
    blocks: TowersPieceBlockPlainObject[]
  }) => void = this.handleAddHooBlocks.bind(this)

  constructor(user: User, tableId: string, users: User[], chat: TableChat, tableSeatManager: TableSeatManager) {
    this.user = user
    this.tableId = tableId
    this.chat = chat
    this.tableSeatManager = tableSeatManager
    this.currentPiece = new TowersPiece()
    this.powerManager = new PowerManager(user, tableId, users, tableSeatManager)
    this.registerSocketListeners()
  }

  private registerSocketListeners(): void {
    this.user.socket.on(SocketEvents.PIECE_MOVE, this.onMovePiece)
    this.user.socket.on(SocketEvents.PIECE_CYCLE, this.onCyclePiece)
    this.user.socket.on(SocketEvents.PIECE_DROP, this.onDropPiece)
    this.user.socket.on(SocketEvents.PIECE_DROP_STOP, this.onStopDropPiece)
    this.user.socket.on(SocketEvents.POWER_USE, this.onUsePower)
    this.user.socket.on(SocketEvents.PIECE_SPEED, this.onSpecialSpeedDrop)
    this.user.socket.on(SocketEvents.GAME_HOO_ADD_BLOCKS, this.onAddHooBlocks)

    this.user.socket.on("disconnect", (reason: DisconnectReason) => {
      const shouldCleanup: boolean =
        reason === "forced close" ||
        reason === "server shutting down" ||
        reason === "forced server close" ||
        reason === "client namespace disconnect" ||
        reason === "server namespace disconnect"

      if (shouldCleanup) {
        this.cleanupSocketListeners()
      }
    })
  }

  private cleanupSocketListeners(): void {
    this.user.socket.off(SocketEvents.PIECE_MOVE, this.onMovePiece)
    this.user.socket.off(SocketEvents.PIECE_CYCLE, this.onCyclePiece)
    this.user.socket.off(SocketEvents.PIECE_DROP, this.onDropPiece)
    this.user.socket.off(SocketEvents.PIECE_DROP_STOP, this.onStopDropPiece)
    this.user.socket.off(SocketEvents.POWER_USE, this.onUsePower)
    this.user.socket.off(SocketEvents.PIECE_SPEED, this.onSpecialSpeedDrop)
    this.user.socket.off(SocketEvents.GAME_HOO_ADD_BLOCKS, this.onAddHooBlocks)
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
    if (
      this.tableId !== tableId ||
      seatNumber !== this.user.getSeatNumber(tableId) ||
      !this.user.isPlayingInTable(tableId)
    )
      return

    switch (direction) {
      case "left":
        this.movePieceLeft()
        break
      case "right":
        this.movePieceRight()
        break
      default:
        break
    }
  }

  private handleCyclePiece({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (
      this.tableId !== tableId ||
      seatNumber !== this.user.getSeatNumber(tableId) ||
      !this.user.isPlayingInTable(tableId)
    )
      return
    this.cyclePieceBlocks()
  }

  private handleDropPiece({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (
      this.tableId !== tableId ||
      seatNumber !== this.user.getSeatNumber(tableId) ||
      !this.user.isPlayingInTable(tableId)
    )
      return
    this.movePieceDown()
  }

  private handleStopDropPiece({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (
      this.tableId !== tableId ||
      seatNumber !== this.user.getSeatNumber(tableId) ||
      !this.user.isPlayingInTable(tableId)
    )
      return
    this.stopMovingPieceDown()
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
    if (
      this.tableId !== tableId ||
      seatNumber !== this.user.getSeatNumber(tableId) ||
      !this.user.isPlayingInTable(tableId)
    )
      return
    this.usePower(targetSeatNumber)
  }

  private handleSpecialSpeedDrop({ tableId, seatNumber }: { tableId: string; seatNumber: number }): void {
    if (
      this.tableId !== tableId ||
      seatNumber !== this.user.getSeatNumber(tableId) ||
      !this.user.isPlayingInTable(tableId)
    )
      return
    this.applySpecialSpeedDrop()
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
    if (this.tableId !== tableId || !blocks || blocks.length === 0) return

    const userSeat: TableSeat | undefined = this.tableSeatManager.getTableSeat(this.user)
    const board: Board | null | undefined = userSeat?.board

    if (!userSeat || !board) return

    const isPartner: boolean = userSeat.occupiedBy?.getTeamNumber(tableId) === teamNumber

    if (
      typeof userSeat.occupiedBy?.getSeatNumber(tableId) !== "undefined" &&
      !isPartner &&
      userSeat.occupiedBy?.isPlayingInTable(tableId) &&
      !isPartner &&
      !board?.isGameOver
    ) {
      board.placeBlocksFromHoo(
        blocks.map((block: TowersPieceBlockPlainObject) => TowersPieceBlock.fromPlainObject(block)),
      )
    }
  }

  public startGameLoop(): void {
    this.tick()
  }

  private tick(): void {
    this.clearGameLoop()

    this.gameLoopIntervalId = setInterval(() => {
      this.tickFallPiece()
    }, this.tickSpeed)
  }

  private updateTickSpeed(newSpeed: TickSpeed): void {
    if (this.tickSpeed !== newSpeed) {
      this.tickSpeed = newSpeed

      if (this.gameLoopIntervalId !== null) {
        this.tick()
      }
    }
  }

  private clearGameLoop(): void {
    if (this.gameLoopIntervalId) {
      clearInterval(this.gameLoopIntervalId)
      this.gameLoopIntervalId = null
    }
  }

  public stopGameLoop(): void {
    // Hide falling piece from board
    if (this.currentPiece.position.row >= HIDDEN_ROWS_COUNT) {
      this.currentPiece.position = { ...this.currentPiece.position, row: BOARD_ROWS + 1 }
    }

    this.clearGameLoop()
    this.cleanupSocketListeners()

    this.sendGameStateToClient()
  }

  /**
   * Current piece falling on the board
   */
  private async tickFallPiece(): Promise<void> {
    if (this.isTickInProgress) return
    this.isTickInProgress = true

    const userSeat: TableSeat | undefined = this.tableSeatManager.getTableSeat(this.user)
    const nextPieces: NextPieces | null | undefined = userSeat?.nextPieces
    const board: Board | null | undefined = userSeat?.board

    if (!userSeat || !nextPieces || !board) {
      this.isTickInProgress = false
      return
    }

    const newPosition: PieceBlockPosition = {
      row: this.currentPiece.position.row + 1,
      col: this.currentPiece.position.col,
    }
    const simulatedPiece: Piece = Piece.simulateAtPosition(this.currentPiece, newPosition)

    if (board.hasCollision(simulatedPiece)) {
      await this.lockPieceInPlace()

      if (board.checkIfGameOver(this.currentPiece)) {
        userSeat.occupiedBy?.updateJoinedTable(this.tableId, { isPlaying: false })
        this.stopGameLoop()
        return
      }

      // Generate next piece
      this.currentPiece = nextPieces.getNextPiece()
      logger.debug(
        `New piece generated: ${JSON.stringify(this.currentPiece.blocks.map((block: PieceBlock) => block.letter))}`,
      )

      if (this.isSpecialSpeedDropActivated) {
        this.removeSpecialSpeedDrop()
      }

      this.sendGameStateToClient()
    } else {
      this.currentPiece.position = newPosition
      this.sendGameStateToClient()
    }

    this.isTickInProgress = false
  }

  /**
   * Lock the piece to the board and gets the next one.
   */
  private async lockPieceInPlace(): Promise<void> {
    const userSeat: TableSeat | undefined = this.tableSeatManager.getTableSeat(this.user)
    const board: Board | null | undefined = userSeat?.board

    if (!userSeat || !board) return

    board.placePiece(this.currentPiece)
    logger.debug(
      `Piece committed to the board at position X=${this.currentPiece.position.col}, Y=${this.currentPiece.position.row}`,
    )

    // Apply piece effects (power blocks)
    if (isMedusaPiece(this.currentPiece) || isMidasPiece(this.currentPiece)) {
      await board.convertSurroundingBlocksToPowerBlocks(this.currentPiece)
      this.sendGameStateToClient()
    }

    // Run all recursive block-breaking logic
    await board.processLandedPiece(async (board, blocksToRemove) => {
      await this.waitForClientToFade(board, blocksToRemove)
    })

    if (board.isHooDetected) {
      this.sendCipherKey()
    }

    // Send removed blocks while hoo is detected to opponents
    if (board.removedBlocksFromHoo.length > 0) {
      this.user.io.to(this.tableId).emit(SocketEvents.GAME_HOO_SEND_BLOCKS, {
        tableId: this.tableId,
        teamNumber: this.user.getTeamNumber(this.tableId),
        blocks: board.removedBlocksFromHoo.map((block: TowersPieceBlock) =>
          new TowersPieceBlock(block.letter as TowersBlockLetter, block.position).toPlainObject(),
        ),
      })

      board.removedBlocksFromHoo = []
    }

    this.addSpecialDiamondsToPowerBar()

    // Force emit partner grid too when it's game over for them
    if (board.partnerBoard && board.partnerBoard.isGameOver) {
      const partnerSeat: TableSeat | undefined = this.tableSeatManager.getSeatByBoard(board.partnerBoard)

      if (partnerSeat) {
        this.user.io.to(this.tableId).emit(SocketEvents.GAME_UPDATE, {
          seatNumber: partnerSeat.seatNumber,
          nextPieces: partnerSeat.nextPieces?.toPlainObject(),
          powerBar: partnerSeat.powerBar?.toPlainObject(),
          board: board.partnerBoard.toPlainObject(),
          currentPiece: null,
        })
      }
    }
  }

  private async waitForClientToFade(board: Board, blocksToRemove: BlockToRemove[]) {
    const seat: TableSeat | undefined = this.tableSeatManager.getSeatByBoard(board)

    if (seat) {
      this.user.io.to(this.tableId).emit(SocketEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL, {
        seatNumber: seat.seatNumber,
        blocks: blocksToRemove,
      })

      await new Promise((resolve) => {
        this.user.socket.once(SocketEvents.GAME_CLIENT_BLOCKS_ANIMATION_DONE, resolve)
      })
    }
  }

  /**
   * Add special diamonds to the power block based on the total number of broken blocks.
   */
  private addSpecialDiamondsToPowerBar(): void {
    const userSeat: TableSeat | undefined = this.tableSeatManager.getTableSeat(this.user)
    const powerBar: PowerBar | null | undefined = userSeat?.powerBar
    const board: Board | null | undefined = userSeat?.board

    if (!userSeat || !powerBar || !board) return

    if (board.removedBlocksCount >= REMOVED_BLOCKS_COUNT_FOR_SPEED_DROP && !board.isSpeedDropUnlocked) {
      powerBar.addItem(new SpecialDiamond("speed drop"))
      board.isSpeedDropUnlocked = true
    }

    if (board.removedBlocksCount >= REMOVED_BLOCKS_COUNT_FOR_REMOVE_POWERS && !board.isRemovePowersUnlocked) {
      powerBar.addItem(new SpecialDiamond("remove powers"))
      board.isRemovePowersUnlocked = true
    }

    if (board.removedBlocksCount >= REMOVED_BLOCKS_COUNT_FOR_REMOVE_STONES && !board.isRemoveStonesUnlocked) {
      powerBar.addItem(new SpecialDiamond("remove stones"))
      board.isRemoveStonesUnlocked = true
    }
  }

  /**
   * Moves the current piece to the left.
   */
  private movePieceLeft(): void {
    const userSeat: TableSeat | undefined = this.tableSeatManager.getTableSeat(this.user)
    const board: Board | null | undefined = userSeat?.board

    if (!userSeat || !board) return

    const newPosition: PieceBlockPosition = {
      row: this.currentPiece.position.row,
      col: this.currentPiece.position.col - 1,
    }
    const simulatedPiece: Piece = Piece.simulateAtPosition(this.currentPiece, newPosition)

    if (!board.hasCollision(simulatedPiece)) {
      this.currentPiece.position = newPosition
      logger.debug("Moved piece left")
      this.sendGameStateToClient()
    }
  }

  /**
   * Moves the current piece to the right.
   */
  private movePieceRight(): void {
    const userSeat: TableSeat | undefined = this.tableSeatManager.getTableSeat(this.user)
    const board: Board | null | undefined = userSeat?.board

    if (!userSeat || !board) return

    const newPosition: PieceBlockPosition = {
      row: this.currentPiece.position.row,
      col: this.currentPiece.position.col + 1,
    }
    const simulatedPiece: Piece = Piece.simulateAtPosition(this.currentPiece, newPosition)

    if (!board.hasCollision(simulatedPiece)) {
      this.currentPiece.position = newPosition
      logger.debug("Moved piece right")
      this.sendGameStateToClient()
    }
  }

  /**
   * Cycles the piece blocks up.
   */
  private cyclePieceBlocks(): void {
    this.currentPiece.cycleBlocks()
    logger.debug("Cycle piece blocks")
    this.sendGameStateToClient()
  }

  /**
   * Increases the piece drop speed.
   */
  private movePieceDown(): void {
    if (this.isSpecialSpeedDropActivated) return

    this.updateTickSpeed(TickSpeed.DROP)
    logger.debug(`Increased piece drop speed to ${this.tickSpeed}ms.`)

    this.sendGameStateToClient()
  }

  /**
   * Stops the piece from moving down fast.
   */
  private stopMovingPieceDown(): void {
    if (this.isSpecialSpeedDropActivated) return

    this.updateTickSpeed(TickSpeed.NORMAL)
    logger.debug(`Reset piece drop speed to ${this.tickSpeed}ms.`)

    this.sendGameStateToClient()
  }

  /**
   * Use a power from the power bar.
   * @param targetSeatNumber - Optional. The seat number to target.
   */
  public usePower(targetSeatNumber?: number): void {
    this.powerManager.usePower(targetSeatNumber)
    this.sendGameStateToClient()
  }

  public applySpecialSpeedDrop(): void {
    this.isSpecialSpeedDropActivated = true
    this.updateTickSpeed(TickSpeed.SPEED_DROP)
  }

  public removeSpecialSpeedDrop(): void {
    this.isSpecialSpeedDropActivated = false
    this.updateTickSpeed(TickSpeed.NORMAL)
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
    const cipherKey: CipherKey | null = CipherHeroManager.getCipherKey(this.user.user.id)

    if (cipherKey) {
      this.chat.addMessage({
        user: this.user,
        type: TableChatMessageType.CIPHER_KEY,
        messageVariables: { encryptedChar: cipherKey.encryptedChar, decryptedChar: cipherKey.decryptedChar },
        visibleToUserId: this.user.user.id,
      })
    }
  }

  private sendGameStateToClient(): void {
    const userSeat: TableSeat | undefined = this.tableSeatManager.getTableSeat(this.user)

    this.user.io.to(this.tableId).emit(SocketEvents.GAME_UPDATE, {
      seatNumber: this.user.getSeatNumber(this.tableId),
      nextPieces: userSeat?.nextPieces?.toPlainObject(),
      powerBar: userSeat?.powerBar?.toPlainObject(),
      board: userSeat?.board?.toPlainObject(),
      currentPiece: this.currentPiece.toPlainObject(),
    })
  }
}
