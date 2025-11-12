import { Socket } from "socket.io";
import { PlayerStats, PlayerStatsJSON } from "@/server/towers/models/PlayerStats";

export interface PlayerJSON {
  readonly id: string
  readonly username: string
  readonly stats?: PlayerStatsJSON
  readonly isConnected: boolean
}

export class Player {
  public id: string;
  public username: string;
  public stats?: PlayerStats;
  public sockets: Set<Socket> = new Set<Socket>();

  constructor(id: string, username: string, stats?: PlayerStats) {
    this.id = id;
    this.username = username;
    this.stats = stats;
  }

  // --------------------------------------------------
  // Socket
  // --------------------------------------------------

  public get isConnected(): boolean {
    return this.sockets.size > 0;
  }

  public attachSocket(socket: Socket): void {
    this.sockets.add(socket);
  }

  public detachSocket(socket: Socket): void {
    this.sockets.delete(socket);
  }

  public emit<T>(event: string, data: T): void {
    for (const socket of this.sockets) {
      socket.emit(event, data);
    }
  }

  public subscribe<T>(event: string, listener: (...args: T[]) => void): void {
    for (const socket of this.sockets) {
      socket.on(event, listener);
    }
  }

  public unsubscribe<T>(event: string, listener: (...args: T[]) => void): void {
    for (const socket of this.sockets) {
      socket.off(event, listener);
    }
  }

  public disconnectAll(): void {
    for (const socket of this.sockets) {
      socket.disconnect(true);
    }

    this.sockets.clear();
  }

  // --------------------------------------------------
  // Serialization
  // --------------------------------------------------

  public toJSON(): PlayerJSON {
    return {
      id: this.id,
      username: this.username,
      stats: this.stats ? this.stats.toJSON() : undefined,
      isConnected: this.isConnected,
    };
  }
}
