import { TowersTableSeatWithRelations, TowersTableWithRelations } from "db";
import { Socket } from "socket.io";
import { SocketEvents } from "@/constants/socket-events";
import prisma from "@/lib/prisma";
import { getTowersTableIncludes } from "@/prisma/selects";
import { Player } from "@/server/towers/models/Player";
import { Table } from "@/server/towers/models/Table";
import { TableSeat } from "@/server/towers/models/TableSeat";

export class ServerState {
  public players: Map<string, Player> = new Map<string, Player>();
  public tables: Map<string, Table> = new Map<string, Table>();

  // --------------------------------------------------
  // Player
  // --------------------------------------------------

  public getOrCreatePlayer(playerId: string, username: string): Player {
    let player: Player | undefined = this.players.get(playerId);

    if (!player) {
      player = new Player(playerId, username);
      this.players.set(playerId, player);
    }

    return player;
  }

  public handlePlayerConnect(socket: Socket, userId: string, username: string): Player {
    const player = this.getOrCreatePlayer(userId, username);
    player.attachSocket(socket);
    socket.join(userId);

    // Only broadcast if player is newly connected (first socket)
    if (player.sockets.size === 1) {
      socket.broadcast.emit(SocketEvents.USER_ONLINE, { userId });
    }

    return player;
  }

  public handlePlayerDisconnect(socket: Socket, userId: string): void {
    const player: Player | undefined = this.players.get(userId);
    if (!player) return;

    player.detachSocket(socket);

    if (!player.isConnected) {
      this.players.delete(userId);
      socket.broadcast.emit(SocketEvents.USER_OFFLINE, { userId });
    }
  }

  public handlePlayerSignOut(socket: Socket, userId: string): void {
    const player: Player | undefined = this.players.get(userId);
    if (!player) return;

    player.disconnectAll();
    this.players.delete(userId);

    socket.emit(SocketEvents.SIGN_OUT_SUCCESS);
    socket.broadcast.emit(SocketEvents.USER_OFFLINE, { userId });
    socket.disconnect(true);
  }

  // --------------------------------------------------
  // Table
  // --------------------------------------------------

  public getOrCreateTable(tableId: string): Table {
    let table: Table | undefined = this.tables.get(tableId);

    if (!table) {
      table = new Table(tableId);
      this.tables.set(tableId, table);
    }

    return table;
  }

  public deleteTable(tableId: string): void {
    const table: Table | undefined = this.tables.get(tableId);
    if (!table) return;

    // Vacate all seats
    table.seats.forEach((tableSeat: TableSeat) => tableSeat.vacate());

    // Clear player states
    table.playersState.clear();

    this.tables.delete(tableId);
  }

  public async reloadTable(tableId: string): Promise<Table | null> {
    const towersTable: TowersTableWithRelations | null = await prisma.towersTable.findUnique({
      where: { id: tableId },
      include: getTowersTableIncludes(),
    });
    if (!towersTable) return null;

    const table: Table = this.getOrCreateTable(towersTable.id);
    table.isRated = towersTable.isRated;

    towersTable.seats.forEach((towersTableSeat: TowersTableSeatWithRelations) => {
      const seat: TableSeat | undefined = table.seats.find(
        (tableSeat: TableSeat) => tableSeat.seatNumber === towersTableSeat.seatNumber,
      );
      if (seat) seat.occupiedByPlayerId = towersTableSeat.occupiedByPlayerId;
    });

    this.tables.set(tableId, table);

    return table;
  }
}

export const serverState: ServerState = new ServerState();
