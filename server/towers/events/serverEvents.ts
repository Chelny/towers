import { GameState } from "db";
import { Redis } from "ioredis";
import { Server as IoServer } from "socket.io";
import { RedisEvents, SocketEvents } from "@/constants/socket-events";
import { logger } from "@/lib/logger";
import { Game } from "@/server/towers/models/Game";
import { Player } from "@/server/towers/models/Player";
import { serverState } from "@/server/towers/models/ServerState";
import { Table } from "@/server/towers/models/Table";

export function serverEvents(redisSub: Redis, io: IoServer): void {
  const channels: string[] = [
    RedisEvents.ROOM_JOIN,
    RedisEvents.ROOM_LEAVE,
    RedisEvents.ROOM_MESSAGE_SEND,
    RedisEvents.TABLE_JOIN,
    RedisEvents.TABLE_LEAVE,
    RedisEvents.TABLE_OPTIONS_UPDATE,
    RedisEvents.TABLE_MESSAGE_SEND,
    RedisEvents.TABLE_INVITE_USER,
    RedisEvents.TABLE_INVITATION_ACCEPT,
    RedisEvents.TABLE_INVITATION_DECLINE,
    RedisEvents.TABLE_BOOT_USER,
    RedisEvents.TABLE_HOST_LEAVE,
    RedisEvents.TABLE_DELETE,
    RedisEvents.TABLE_SEAT_SIT,
    RedisEvents.TABLE_SEAT_STAND,
    RedisEvents.TABLE_PLAYER_STATE_UPDATE,
    RedisEvents.GAME_CONTROL_KEYS_UPDATE,
    RedisEvents.GAME_STATE,
    RedisEvents.GAME_COUNTDOWN,
    RedisEvents.GAME_TIMER,
    RedisEvents.GAME_UPDATE,
    RedisEvents.GAME_OVER,
    RedisEvents.GAME_POWER_FIRE,
    RedisEvents.GAME_HOO_SEND_BLOCKS,
    RedisEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL,
    RedisEvents.PIECE_SPEED,
    RedisEvents.CONVERSATION_MESSAGE_SEND,
    RedisEvents.CONVERSATION_MESSAGE_READ,
  ];

  redisSub.subscribe(...channels, (error: Error | null | undefined) => {
    if (error) return logger.error(error);
  });

  redisSub.on("message", (channel: string, message: string) => {
    const data = JSON.parse(message);

    switch (channel) {
      case RedisEvents.ROOM_JOIN: {
        const { roomId, roomPlayer } = data;
        io.emit(SocketEvents.ROOMS_LIST_UPDATED);
        io.to(roomId).emit(SocketEvents.ROOM_PLAYER_JOINED, { roomPlayer });
        break;
      }
      case RedisEvents.ROOM_LEAVE: {
        const { roomId, roomPlayer } = data;
        io.emit(SocketEvents.ROOMS_LIST_UPDATED);
        io.to(roomId).emit(SocketEvents.ROOM_PLAYER_LEFT, { roomPlayer });
        break;
      }
      case RedisEvents.ROOM_MESSAGE_SEND: {
        const { roomId, chatMessage } = data;
        io.to(roomId).emit(SocketEvents.ROOM_MESSAGE_SENT, { chatMessage });
        break;
      }
      case RedisEvents.TABLE_JOIN: {
        const { table, tablePlayer } = data;
        io.to([table.roomId, table.id]).emit(SocketEvents.TABLE_PLAYER_JOINED, { tablePlayer });
        io.to(table.roomId).emit(SocketEvents.TABLE_UPDATED, { table });
        break;
      }
      case RedisEvents.TABLE_LEAVE: {
        const { table, tablePlayer } = data;
        io.to([table.roomId, table.id]).emit(SocketEvents.TABLE_PLAYER_LEFT, { tablePlayer });
        io.to(table.roomId).emit(SocketEvents.TABLE_UPDATED, { table });
        break;
      }
      case RedisEvents.TABLE_OPTIONS_UPDATE: {
        const { table } = data;

        // Sync in-memory table properties
        const tableInstance: Table = serverState.getOrCreateTable(table.id);

        const game: Game | undefined = tableInstance.game;
        const isGameWaiting: boolean = !game || game.state === GameState.WAITING;

        if (isGameWaiting) {
          tableInstance.isRated = table.isRated;
        } else if (table.isRated !== tableInstance.isRated) {
          console.warn(`[TABLE_OPTIONS_UPDATE] Ignored isRated change (game=${game?.state})`);
        }

        io.to(table.roomId).emit(SocketEvents.TABLE_UPDATED, {
          table: {
            ...table,
            isRated: tableInstance.isRated,
          },
        });
        break;
      }
      case RedisEvents.TABLE_MESSAGE_SEND: {
        const { tableId, chatMessage } = data;
        io.to(tableId).emit(SocketEvents.TABLE_MESSAGE_SENT, { chatMessage });
        break;
      }
      case RedisEvents.TABLE_INVITE_USER: {
        const { userId, notification } = data;
        io.to(userId).emit(SocketEvents.TABLE_INVITATION_INVITED_NOTIFICATION, { notification });
        break;
      }
      case RedisEvents.TABLE_INVITATION_ACCEPT: {
        const { userId, table } = data;
        io.to(userId).emit(SocketEvents.TABLE_UPDATED, { table });
        break;
      }
      case RedisEvents.TABLE_INVITATION_DECLINE: {
        const { userId, notification } = data;
        io.to(userId).emit(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, { notification });
        break;
      }
      case RedisEvents.TABLE_BOOT_USER: {
        const { userId, notification } = data;
        io.to(userId).emit(SocketEvents.TABLE_BOOTED_NOTIFICATION, { notification });
        break;
      }
      case RedisEvents.TABLE_HOST_LEAVE: {
        const { table } = data;
        io.to([table.roomId, table.id]).emit(SocketEvents.TABLE_UPDATED, { table });
        break;
      }
      case RedisEvents.TABLE_DELETE: {
        const { table } = data;
        io.to(table.roomId).emit(SocketEvents.TABLE_DELETED, { tableId: table.id });
        break;
      }
      case RedisEvents.TABLE_PLAYER_STATE_UPDATE: {
        const { tableId, playerId, isReady, isPlaying } = data;
        io.to(tableId).emit(SocketEvents.TABLE_PLAYER_STATE_UPDATED, { playerId, isReady, isPlaying });
        break;
      }
      case RedisEvents.TABLE_SEAT_SIT:
      case RedisEvents.TABLE_SEAT_STAND: {
        const { tableSeat } = data;

        io.to([tableSeat.table.roomId, tableSeat.tableId]).emit(SocketEvents.TABLE_SEAT_UPDATED, { tableSeat });

        // In-memory
        const table: Table = serverState.getOrCreateTable(tableSeat.tableId);
        const player: Player = serverState.getOrCreatePlayer(
          tableSeat.occupiedByPlayerId,
          tableSeat.occupiedByPlayer?.user.username,
        );

        if (channel === RedisEvents.TABLE_SEAT_SIT) {
          table.occupySeat(tableSeat.seatNumber, player);
        } else {
          table.vacateSeat(tableSeat.seatNumber);
        }

        io.to(tableSeat.tableId).emit(SocketEvents.TABLE_PLAYER_STATE_UPDATED, {
          playerId: tableSeat.occupiedByPlayerId,
          isReady: table.isPlayerReady(tableSeat.occupiedByPlayerId),
          isPlaying: table.isPlayerPlaying(tableSeat.occupiedByPlayerId),
        });
        break;
      }
      case RedisEvents.GAME_CONTROL_KEYS_UPDATE: {
        const { userId, controlKeys } = data;
        io.to(userId).emit(SocketEvents.GAME_CONTROL_KEYS_UPDATED, { controlKeys });
        break;
      }
      case RedisEvents.GAME_STATE: {
        const { tableId, gameState } = data;
        io.to(tableId).emit(SocketEvents.GAME_STATE, { gameState });
        break;
      }
      case RedisEvents.GAME_COUNTDOWN: {
        const { tableId, countdown } = data;
        io.to(tableId).emit(SocketEvents.GAME_COUNTDOWN, { countdown });
        break;
      }
      case RedisEvents.GAME_TIMER: {
        const { tableId, timer } = data;
        io.to(tableId).emit(SocketEvents.GAME_TIMER, { timer });
        break;
      }
      case RedisEvents.GAME_UPDATE: {
        const { tableId, seatNumber, nextPieces, powerBar, board, currentPiece } = data;
        io.to(tableId).emit(SocketEvents.GAME_UPDATE, { seatNumber, nextPieces, powerBar, board, currentPiece });
        break;
      }
      case RedisEvents.GAME_OVER: {
        const { tableId, winners, isWinner, isPlayedThisRound } = data;
        io.to(tableId).emit(SocketEvents.GAME_OVER, { winners, isWinner, isPlayedThisRound });
        break;
      }
      case RedisEvents.GAME_POWER_FIRE: {
        const { tableId, sourceUsername, targetUsername, targetSeatNumber, powerItem } = data;
        io.to(tableId).emit(SocketEvents.GAME_POWER_FIRE, {
          sourceUsername,
          targetUsername,
          targetSeatNumber,
          powerItem,
        });
        break;
      }
      case RedisEvents.GAME_HOO_SEND_BLOCKS: {
        const { tableId, teamNumber, blocks } = data;
        io.to(tableId).emit(SocketEvents.GAME_HOO_SEND_BLOCKS, { tableId, teamNumber, blocks });
        break;
      }
      case RedisEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL: {
        const { tableId, seatNumber, blocks } = data;
        io.to(tableId).emit(SocketEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL, { tableId, seatNumber, blocks });
        break;
      }
      case RedisEvents.PIECE_SPEED: {
        const { tableId, seatNumber } = data;
        io.to(tableId).emit(SocketEvents.PIECE_SPEED, { tableId, seatNumber });
        break;
      }
      case RedisEvents.CONVERSATION_MESSAGE_SEND: {
        const { userIds, conversation } = data;
        io.to(userIds.map((userId: string) => userId)).emit(SocketEvents.CONVERSATION_MESSAGE_SENT, { conversation });
        break;
      }
      case RedisEvents.CONVERSATION_MESSAGE_READ: {
        const { userId, conversationId } = data;
        io.to(userId).emit(SocketEvents.CONVERSATION_MESSAGE_MARK_AS_READ, { conversationId });
        break;
      }
    }
  });
}
