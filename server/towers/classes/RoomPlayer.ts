import { Player, PlayerPlainObject } from "@/server/towers/classes/Player";

export interface RoomPlayerProps {
  id: string
  roomId: string
  player: Player
}

export interface RoomPlayerPlainObject {
  readonly id: string
  readonly roomId: string
  readonly playerId: string
  readonly player: PlayerPlainObject
  readonly createdAt: string
  readonly updatedAt: string

  // In-memory property
  readonly tableNumber: number | null
}

export class RoomPlayer {
  public readonly id: string;
  public readonly roomId: string;
  public playerId: string;
  private _player: Player;
  public createdAt: Date;
  public updatedAt: Date;

  // In-memory property
  public tableNumber: number | null = null;

  constructor(props: RoomPlayerProps) {
    this.id = props.id;
    this.roomId = props.roomId;
    this.playerId = props.player.id;
    this._player = props.player;
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
  }

  public get player(): Player {
    return this._player;
  }

  public set player(player: Player) {
    this._player = player;
    this.playerId = player.id;
  }

  public toPlainObject(): RoomPlayerPlainObject {
    return {
      id: this.id,
      roomId: this.roomId,
      playerId: this.playerId,
      player: this.player.toPlainObject(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),

      // In-memory property
      tableNumber: this.tableNumber,
    };
  }
}
