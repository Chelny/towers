import {
  TableType,
  TowersPlayerWithRelations,
  TowersRoomPlayerWithRelations,
  TowersRoomWithRelations,
  TowersTableInvitation,
  TowersTablePlayerWithRelations,
  TowersTableWithRelations,
} from "db";
import { ROOM_MAX_USERS_CAPACITY } from "@/constants/game";

export const canUserAccessRoom = (room: TowersRoomWithRelations, player: TowersPlayerWithRelations): boolean => {
  // Check if the player is already in the room
  const isPlayerInRoom: boolean = room.players.some(
    (roomPlayer: TowersRoomPlayerWithRelations) => roomPlayer.playerId === player.id,
  );
  if (isPlayerInRoom) return true;

  // Check if room is full
  const isFull: boolean = room.players.length >= ROOM_MAX_USERS_CAPACITY;
  if (!isFull) return true;

  return false;
};

export const canUserAccessTable = (table: TowersTableWithRelations, player: TowersPlayerWithRelations): boolean => {
  // Check if the player is already in the table
  const isPlayerInTable: boolean = table.players.some(
    (tablePlayer: TowersTablePlayerWithRelations) => tablePlayer.playerId === player.id,
  );
  if (isPlayerInTable) return true;

  // Allow first user (host) to access
  const hostPlayerId: string = table.hostPlayerId;
  if (!hostPlayerId || player.id === hostPlayerId) return true;

  // Public or Protected tables are open to all
  if (table.tableType === TableType.PUBLIC || table.tableType === TableType.PROTECTED) {
    return true;
  }

  // Private tables require invitation
  const isInvited: boolean = player.receivedTableInvitations?.some(
    (tableInvitation: TowersTableInvitation) => tableInvitation.tableId === table.id,
  );
  if (table.tableType === TableType.PRIVATE && isInvited) return true;

  return false;
};
