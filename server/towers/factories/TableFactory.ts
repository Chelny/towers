import {
  TowersPlayerLite,
  TowersTableChatMessageWithRelations,
  TowersTablePlayerWithRelations,
  TowersTableSeatWithRelations,
  TowersTableWithRelations,
} from "db";
import { Player } from "@/server/towers/classes/Player";
import { Room } from "@/server/towers/classes/Room";
import { Table, TablePlainObject } from "@/server/towers/classes/Table";
import { TableChatMessage, TableChatMessageVariables } from "@/server/towers/classes/TableChatMessage";
import { TablePlayer } from "@/server/towers/classes/TablePlayer";
import { TableSeat } from "@/server/towers/classes/TableSeat";
import { PlayerFactory } from "@/server/towers/factories/PlayerFactory";
import { RoomFactory } from "@/server/towers/factories/RoomFactory";
import { TableManager } from "@/server/towers/managers/TableManager";
import { isObject } from "@/utils/object";

export class TableFactory {
  public static convertToPlainObject(dbTable: TowersTableWithRelations, userId: string): TablePlainObject {
    const room: Room = RoomFactory.createRoom(dbTable.room);
    const hostPlayer: Player = PlayerFactory.createPlayer(dbTable.hostPlayer);
    const table: Table = new Table({ ...dbTable, room, hostPlayer });

    table.players = dbTable.players.map((tp: TowersTablePlayerWithRelations) => {
      const dbPlayer: TowersPlayerLite = tp.player;
      const player: Player = PlayerFactory.createPlayer(dbPlayer);
      const tablePlayer: TablePlayer = new TablePlayer({ id: tp.id, table, player });

      tablePlayer.createdAt = tp.createdAt;
      tablePlayer.updatedAt = tp.updatedAt;

      return tablePlayer;
    });

    table.seats = dbTable.seats.reduce((acc: TableSeat[], t: TowersTableSeatWithRelations) => {
      const tablePlayer: TablePlayer | undefined = table.players.find(
        (tp: TablePlayer) => tp.playerId === t.occupiedByPlayerId,
      );
      if (!tablePlayer) return acc;

      acc.push(new TableSeat({ ...t, occupiedByPlayer: tablePlayer.player }));

      return acc;
    }, [] as TableSeat[]);

    table.chatMessages = dbTable.chatMessages.reduce(
      (acc: TableChatMessage[], rcm: TowersTableChatMessageWithRelations) => {
        const tablePlayer: TablePlayer | undefined = table.players.find(
          (tp: TablePlayer) => tp.player.id === rcm.playerId,
        );
        if (!tablePlayer) return acc;

        const variables: TableChatMessageVariables | null =
          rcm.textVariables && isObject(rcm.textVariables) ? (rcm.textVariables as TableChatMessageVariables) : null;

        acc.push(new TableChatMessage({ ...rcm, player: tablePlayer.player, textVariables: variables }));

        return acc;
      },
      [] as TableChatMessage[],
    );

    return TableManager.tableViewForPlayer(table, userId);
  }
}
