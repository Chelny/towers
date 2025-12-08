import { RoomLevel } from "db";
import { ROOM_MAX_USERS_CAPACITY } from "@/constants/game";
import { RoomChatMessage, RoomChatMessagePlainObject } from "@/server/towers/classes/RoomChatMessage";
import { RoomPlayer, RoomPlayerPlainObject } from "@/server/towers/classes/RoomPlayer";
import { Table, TablePlainObject } from "@/server/towers/classes/Table";

export interface RoomProps {
  id: string
  name: string
  level: RoomLevel
  sortOrder: number
  isFull: boolean
}

export interface RoomPlainObject {
  readonly id: string
  readonly name: string
  readonly level: RoomLevel
  readonly sortOrder: number
  readonly isFull: boolean
  readonly players: RoomPlayerPlainObject[]
  readonly chatMessages: RoomChatMessagePlainObject[]
  readonly tables: TablePlainObject[]
  readonly playersCount: number
}

export type RoomLitePlainObject = Omit<RoomPlainObject, "players" | "chatMessages" | "tables">;

export class Room {
  public readonly id: string;
  public readonly name: string;
  public readonly level: RoomLevel;
  public readonly sortOrder: number;
  public isFull: boolean;
  public _players: RoomPlayer[] = [];
  public chatMessages: RoomChatMessage[] = [];
  public tables: Table[] = [];

  constructor(props: RoomProps) {
    this.id = props.id;
    this.name = props.name;
    this.level = props.level;
    this.sortOrder = props.sortOrder;
    this.isFull = props.isFull;
  }

  public get players(): RoomPlayer[] {
    return this._players;
  }

  public set players(players: RoomPlayer[]) {
    this._players = players;
    this.isFull = this.players.length >= ROOM_MAX_USERS_CAPACITY;
  }

  public get playersCount(): number {
    return this.players.length;
  }

  public addPlayer(roomPlayer: RoomPlayer): void {
    if (!this.players.some((rp: RoomPlayer) => rp.playerId === roomPlayer.playerId)) {
      this.players.push(roomPlayer);
    }
  }

  public removePlayer(roomPlayer: RoomPlayer): void {
    this.players = this.players.filter((rp: RoomPlayer) => rp.playerId !== roomPlayer.playerId);
  }

  public addChatMessage(message: RoomChatMessage): void {
    this.chatMessages.push(message);
  }

  public addTable(table: Table): void {
    if (!this.tables.some((t: Table) => t.id === table.id)) {
      table.onRemove(() => {
        table.game?.destroy();
        table.game = null;

        this.removeTable(table);
      });

      this.tables.push(table);
    }
  }

  public removeTable(table: Table): void {
    this.tables = this.tables.filter((t: Table) => t.id !== table.id);
  }

  public messagesFor(playerId: string): RoomChatMessage[] {
    const roomPlayer: RoomPlayer | undefined = this.players.find((rp: RoomPlayer) => rp.playerId === playerId);
    if (!roomPlayer) return [];

    return this.chatMessages.filter((rcm: RoomChatMessage) => rcm.createdAt >= roomPlayer.createdAt);
  }

  public toLitePlainObject(): RoomLitePlainObject {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      sortOrder: this.sortOrder,
      isFull: this.isFull,
      playersCount: this.playersCount,
    };
  }

  public toPlainObject(): RoomPlainObject {
    return {
      ...this.toLitePlainObject(),
      players: this.players.map((rp: RoomPlayer) => rp.toPlainObject()),
      chatMessages: this.chatMessages.map((rcm: RoomChatMessage) => rcm.toPlainObject()),
      tables: this.tables.map((t: Table) => t.toPlainObject()),
    };
  }
}
