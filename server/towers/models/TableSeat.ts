import { Board, BoardPlainObject } from "@/server/towers/game/Board";
import { NextPieces, NextPiecesPlainObject } from "@/server/towers/game/NextPieces";
import { PieceBlock } from "@/server/towers/game/PieceBlock";
import { PowerBar, PowerBarPlainObject } from "@/server/towers/game/PowerBar";
import { TowersPieceBlockPowerManager } from "@/server/towers/game/TowersPieceBlockPowerManager";
import { Player, PlayerJSON } from "@/server/towers/models/Player";
import { isPowerBarItem } from "@/server/towers/utils/piece-type-check";

export interface TableSeatJSON {
  readonly tableId: string
  readonly seatNumber: number
  readonly teamNumber: number
  readonly occupiedByPlayerId: string | null
  readonly occupiedByPlayer: PlayerJSON | null
  readonly board: BoardPlainObject | null
  readonly nextPieces: NextPiecesPlainObject | null
  readonly powerBar: PowerBarPlainObject | null
}

export class TableSeat {
  public tableId: string;
  public seatNumber: number;
  public teamNumber: number;
  public occupiedByPlayerId: string | null = null;
  public occupiedByPlayer: Player | null = null;
  public towersPieceBlockPowerManager: TowersPieceBlockPowerManager | null = null;
  public board: Board | null = null;
  public nextPieces: NextPieces | null = null;
  public powerBar: PowerBar | null = null;

  constructor(tableId: string, seatNumber: number, teamNumber: number) {
    this.tableId = tableId;
    this.seatNumber = seatNumber;
    this.teamNumber = teamNumber;
  }

  public occupy(player: Player): void {
    this.occupiedByPlayerId = player.id;
    this.occupiedByPlayer = player;
  }

  public vacate(): void {
    this.occupiedByPlayerId = null;
    this.occupiedByPlayer = null;
    this.clearSeatGame();
  }

  public initialize(): void {
    this.towersPieceBlockPowerManager = new TowersPieceBlockPowerManager();
    this.nextPieces = new NextPieces(this.towersPieceBlockPowerManager);
    this.powerBar = new PowerBar();
    this.board = new Board(this.towersPieceBlockPowerManager, (block: PieceBlock) => {
      if (this.powerBar && isPowerBarItem(block)) {
        this.powerBar.addItem(block);
      }
    });
  }

  public clearSeatGame(): void {
    this.towersPieceBlockPowerManager = null;
    this.board = null;
    this.nextPieces = null;
    this.powerBar = null;
  }

  // --------------------------------------------------
  // Serialization
  // --------------------------------------------------

  public toJSON(): TableSeatJSON {
    return {
      tableId: this.tableId,
      seatNumber: this.seatNumber,
      teamNumber: this.teamNumber,
      occupiedByPlayerId: this.occupiedByPlayerId,
      occupiedByPlayer: this.occupiedByPlayer ? this.occupiedByPlayer.toJSON() : null,
      board: this.board ? this.board.toPlainObject() : null,
      nextPieces: this.nextPieces ? this.nextPieces.toPlainObject() : null,
      powerBar: this.powerBar ? this.powerBar.toPlainObject() : null,
    };
  }
}
