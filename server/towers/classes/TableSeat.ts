import { Board, BoardPlainObject } from "@/server/towers/classes/Board"
import { NextPieces, NextPiecesPlainObject } from "@/server/towers/classes/NextPieces"
import { PieceBlock } from "@/server/towers/classes/PieceBlock"
import { PowerBar, PowerBarPlainObject } from "@/server/towers/classes/PowerBar"
import { TowersPieceBlockPowerManager } from "@/server/towers/classes/TowersPieceBlockPowerManager"
import { User, UserPlainObject } from "@/server/towers/classes/User"
import { isPowerBarItem } from "@/server/towers/utils/piece-type-check"

export interface TableSeatPlainObject {
  seatNumber: number
  targetNumber: number
  teamNumber: number
  occupiedBy?: UserPlainObject
  board?: BoardPlainObject
  nextPieces?: NextPiecesPlainObject
  powerBar?: PowerBarPlainObject
}

/**
 * Represents an individual seat at a table.
 *
 * Each seat can be assigned to a player, and contains gameplay state like the board and power bar.
 */
export class TableSeat {
  public tableId: string
  public seatNumber: number
  public targetNumber: number
  public teamNumber: number
  public occupiedBy: User | null = null
  public towersPieceBlockPowerManager: TowersPieceBlockPowerManager | null = null
  public nextPieces: NextPieces | null = null
  public powerBar: PowerBar | null = null
  public board: Board | null = null

  constructor(tableId: string, seatNumber: number) {
    this.tableId = tableId
    this.seatNumber = seatNumber
    this.targetNumber = seatNumber
    this.teamNumber = Math.ceil(seatNumber / 2)
  }

  public setUser(user: User): void {
    this.occupiedBy = user
  }

  public removeUser(): void {
    this.occupiedBy = null
  }

  /**
   * Set up the seat for a player.
   * Initializes game-related objects for the player sitting.
   */
  public initialize(): void {
    this.towersPieceBlockPowerManager = new TowersPieceBlockPowerManager()
    this.nextPieces = new NextPieces(this.towersPieceBlockPowerManager)
    this.powerBar = new PowerBar()
    this.board = new Board(this.towersPieceBlockPowerManager, (block: PieceBlock) => {
      if (this.powerBar && isPowerBarItem(block)) {
        this.powerBar.addItem(block)
      }
    })
  }

  public clearSeatUser(): void {
    this.occupiedBy = null
  }

  /**
   * Clear the seat board, next pieces and power bar.
   * Resets game-related objects when game starts.
   */
  public clearSeatGame(): void {
    this.towersPieceBlockPowerManager = null
    this.nextPieces = null
    this.powerBar = null
    this.board = null
  }

  public toPlainObject(): TableSeatPlainObject {
    return {
      seatNumber: this.seatNumber,
      targetNumber: this.targetNumber,
      teamNumber: this.teamNumber,
      occupiedBy: this.occupiedBy?.toPlainObject(),
      board: this.board?.toPlainObject(),
      nextPieces: this.nextPieces?.toPlainObject(),
      powerBar: this.powerBar?.toPlainObject(),
    }
  }
}
