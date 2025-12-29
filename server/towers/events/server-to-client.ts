import { logger } from "better-auth";
import { Redis } from "ioredis";
import { Server as IoServer, Socket } from "socket.io";
import { ServerInternalEvents } from "@/constants/socket/server-internal";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { Room } from "@/server/towers/classes/Room";
import { Table } from "@/server/towers/classes/Table";
import { RoomManager } from "@/server/towers/managers/RoomManager";
import { TableManager } from "@/server/towers/managers/TableManager";
import { UserRelationshipManager } from "@/server/towers/managers/UserRelationshipManager";

export function serverToClientEvents(redisSub: Redis, io: IoServer): void {
  const channels: string[] = [
    ServerInternalEvents.USER_SETTINGS_AVATAR,
    ServerInternalEvents.USER_RELATIONSHIP_MUTE,
    ServerInternalEvents.USER_RELATIONSHIP_UNMUTE,
    ServerInternalEvents.CONVERSATION_MARK_AS_READ,
    ServerInternalEvents.CONVERSATION_MUTE,
    ServerInternalEvents.CONVERSATION_UNMUTE,
    ServerInternalEvents.CONVERSATION_REMOVE,
    ServerInternalEvents.CONVERSATION_RESTORE,
    ServerInternalEvents.CONVERSATION_MESSAGE_SEND,
    ServerInternalEvents.ROOM_JOIN,
    ServerInternalEvents.ROOM_LEAVE,
    ServerInternalEvents.ROOM_MESSAGE_SEND,
    ServerInternalEvents.TABLE_JOIN,
    ServerInternalEvents.TABLE_LEAVE,
    ServerInternalEvents.TABLE_OPTIONS_UPDATE,
    ServerInternalEvents.TABLE_MESSAGE_SEND,
    ServerInternalEvents.TABLE_INVITE_USER,
    ServerInternalEvents.TABLE_INVITATION_ACCEPT,
    ServerInternalEvents.TABLE_INVITATION_DECLINE,
    ServerInternalEvents.TABLE_BOOT_USER,
    ServerInternalEvents.TABLE_HOST_LEAVE,
    ServerInternalEvents.TABLE_DELETE,
    ServerInternalEvents.TABLE_SEAT_SIT,
    ServerInternalEvents.TABLE_SEAT_STAND,
    ServerInternalEvents.TABLE_SEAT_PLAYER_STATE,
    ServerInternalEvents.GAME_CONTROL_KEYS_UPDATE,
    ServerInternalEvents.GAME_STATE,
    ServerInternalEvents.GAME_COUNTDOWN,
    ServerInternalEvents.GAME_TIMER,
    ServerInternalEvents.GAME_UPDATE,
    ServerInternalEvents.GAME_OVER,
    ServerInternalEvents.GAME_POWER_FIRE,
    ServerInternalEvents.GAME_HOO_SEND_BLOCKS,
    ServerInternalEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL,
    ServerInternalEvents.PIECE_SPEED,
    ServerInternalEvents.NOTIFICATION_MARK_AS_READ,
    ServerInternalEvents.NOTIFICATION_DELETE,
  ];

  redisSub.subscribe(...channels, (error: Error | null | undefined) => {
    if (error) return logger.error(error.message);
  });

  redisSub.on("message", async (channel: string, message: string) => {
    const data = JSON.parse(message);

    switch (channel) {
      case ServerInternalEvents.USER_SETTINGS_AVATAR: {
        const { userId, avatarId } = data;
        io.emit(ServerToClientEvents.USER_SETTINGS_AVATAR, { userId, avatarId });
        break;
      }
      case ServerInternalEvents.USER_RELATIONSHIP_MUTE: {
        const { sourceUserId } = data;
        io.to(sourceUserId).emit(ServerToClientEvents.USER_RELATIONSHIP_MUTE);
        break;
      }
      case ServerInternalEvents.USER_RELATIONSHIP_UNMUTE: {
        const { sourceUserId } = data;
        io.to(sourceUserId).emit(ServerToClientEvents.USER_RELATIONSHIP_UNMUTE);
        break;
      }
      case ServerInternalEvents.CONVERSATION_MUTE: {
        const { userId, conversationId, unreadConversationsCount } = data;
        io.to(userId).emit(ServerToClientEvents.CONVERSATION_MUTE, { conversationId });
        io.to(userId).emit(ServerToClientEvents.CONVERSATIONS_UNREAD, { unreadConversationsCount });
        break;
      }
      case ServerInternalEvents.CONVERSATION_UNMUTE: {
        const { userId, conversationId, unreadConversationsCount } = data;
        io.to(userId).emit(ServerToClientEvents.CONVERSATION_UNMUTE, { conversationId });
        io.to(userId).emit(ServerToClientEvents.CONVERSATIONS_UNREAD, { unreadConversationsCount });
        break;
      }
      case ServerInternalEvents.CONVERSATION_REMOVE: {
        const { userId, conversationId, unreadConversationsCount } = data;
        io.to(userId).emit(ServerToClientEvents.CONVERSATION_REMOVE, { conversationId });
        io.to(userId).emit(ServerToClientEvents.CONVERSATIONS_UNREAD, { unreadConversationsCount });
        break;
      }
      case ServerInternalEvents.CONVERSATION_RESTORE: {
        const { userId, conversation, unreadConversationsCount } = data;
        io.to(userId).emit(ServerToClientEvents.CONVERSATION_RESTORE, { conversation });
        io.to(userId).emit(ServerToClientEvents.CONVERSATIONS_UNREAD, { unreadConversationsCount });
        break;
      }
      case ServerInternalEvents.CONVERSATION_MESSAGE_SEND: {
        const { userId, conversation, unreadConversationsCount } = data;
        io.to(userId).emit(ServerToClientEvents.CONVERSATION_MESSAGE_SENT, { conversation });
        io.to(userId).emit(ServerToClientEvents.CONVERSATIONS_UNREAD, { unreadConversationsCount });
        break;
      }
      case ServerInternalEvents.CONVERSATION_MARK_AS_READ: {
        const { userId, conversationId, unreadConversationsCount } = data;
        io.to(userId).emit(ServerToClientEvents.CONVERSATION_MARK_AS_READ, { conversationId });
        io.to(userId).emit(ServerToClientEvents.CONVERSATIONS_UNREAD, { unreadConversationsCount });
        break;
      }
      case ServerInternalEvents.ROOM_JOIN: {
        const { roomId, roomPlayer } = data;
        io.emit(ServerToClientEvents.ROOMS_LIST_UPDATED);
        io.to(roomId).emit(ServerToClientEvents.ROOM_PLAYER_JOINED, { roomPlayer });
        break;
      }
      case ServerInternalEvents.ROOM_LEAVE: {
        const { roomId, roomPlayer } = data;
        io.emit(ServerToClientEvents.ROOMS_LIST_UPDATED);
        io.to(roomId).emit(ServerToClientEvents.ROOM_PLAYER_LEFT, { roomPlayer });
        break;
      }
      case ServerInternalEvents.ROOM_MESSAGE_SEND: {
        const { roomId, chatMessage } = data;

        const room: Room | undefined = RoomManager.get(roomId);
        if (!room) break;

        const senderId: string = chatMessage.player.id;

        for (const rp of room.players) {
          const socket: Socket | null = rp.player.user?.socket;
          if (!socket) continue;

          const mutedUserIds: string[] = await UserRelationshipManager.mutedUserIdsFor(rp.player.id);

          // Only send if they have NOT muted the sender
          if (!mutedUserIds.includes(senderId)) {
            socket.emit(ServerToClientEvents.ROOM_MESSAGE_SENT, { chatMessage });
          }
        }

        break;
      }
      case ServerInternalEvents.TABLE_JOIN: {
        const { table, tablePlayer } = data;
        io.to([table.roomId, table.id]).emit(ServerToClientEvents.TABLE_PLAYER_JOINED, { tablePlayer });
        io.to(table.roomId).emit(ServerToClientEvents.TABLE_UPDATED, { table });
        break;
      }
      case ServerInternalEvents.TABLE_LEAVE: {
        const { table, tablePlayer } = data;
        io.to([table.roomId, table.id]).emit(ServerToClientEvents.TABLE_PLAYER_LEFT, { tablePlayer });
        io.to(table.roomId).emit(ServerToClientEvents.TABLE_UPDATED, { table });
        break;
      }
      case ServerInternalEvents.TABLE_OPTIONS_UPDATE: {
        const { table } = data;
        io.to(table.roomId).emit(ServerToClientEvents.TABLE_UPDATED, { table });
        break;
      }
      case ServerInternalEvents.TABLE_MESSAGE_SEND: {
        const { tableId, chatMessage } = data;

        const table: Table | undefined = TableManager.get(tableId);
        if (!table) break;

        const senderId: string = chatMessage.player.id;

        for (const tp of table.players) {
          const socket: Socket | null = tp.player.user?.socket;
          if (!socket) continue;

          const mutedUserIds: string[] = await UserRelationshipManager.mutedUserIdsFor(tp.player.id);

          // Only send if they have NOT muted the sender
          if (!mutedUserIds.includes(senderId)) {
            socket.emit(ServerToClientEvents.TABLE_MESSAGE_SENT, { chatMessage });
          }
        }
        break;
      }
      case ServerInternalEvents.TABLE_INVITE_USER: {
        const { userId, notification } = data;
        io.to(userId).emit(ServerToClientEvents.TABLE_INVITATION_INVITED_NOTIFICATION, { notification });
        break;
      }
      case ServerInternalEvents.TABLE_INVITATION_ACCEPT: {
        const { userId, table } = data;
        io.to(userId).emit(ServerToClientEvents.TABLE_UPDATED, { table });
        break;
      }
      case ServerInternalEvents.TABLE_INVITATION_DECLINE: {
        const { userId, notification } = data;
        io.to(userId).emit(ServerToClientEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, { notification });
        break;
      }
      case ServerInternalEvents.TABLE_BOOT_USER: {
        const { userId, notification } = data;
        io.to(userId).emit(ServerToClientEvents.TABLE_BOOTED_NOTIFICATION, { notification });
        break;
      }
      case ServerInternalEvents.TABLE_HOST_LEAVE: {
        const { table } = data;
        io.to([table.roomId, table.id]).emit(ServerToClientEvents.TABLE_UPDATED, { table });
        break;
      }
      case ServerInternalEvents.TABLE_DELETE: {
        const { table } = data;
        io.to(table.roomId).emit(ServerToClientEvents.TABLE_DELETED, { tableId: table.id });
        break;
      }
      case ServerInternalEvents.TABLE_SEAT_SIT:
      case ServerInternalEvents.TABLE_SEAT_STAND: {
        const { roomId, tableSeat, tablePlayer } = data;
        io.to([roomId, tableSeat.tableId]).emit(ServerToClientEvents.TABLE_SEAT_UPDATED, { tableSeat, tablePlayer });
        break;
      }
      case ServerInternalEvents.TABLE_SEAT_PLAYER_STATE: {
        const { tablePlayer } = data;
        io.to([tablePlayer.tableId]).emit(ServerToClientEvents.TABLE_PLAYER_UPDATED, { tablePlayer });
        break;
      }
      case ServerInternalEvents.GAME_CONTROL_KEYS_UPDATE: {
        const { userId, controlKeys } = data;
        io.to(userId).emit(ServerToClientEvents.GAME_CONTROL_KEYS_UPDATED, { controlKeys });
        break;
      }
      case ServerInternalEvents.GAME_STATE: {
        const { tableId, gameState } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_STATE, { gameState });
        break;
      }
      case ServerInternalEvents.GAME_COUNTDOWN: {
        const { tableId, countdown } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_COUNTDOWN, { countdown });
        break;
      }
      case ServerInternalEvents.GAME_TIMER: {
        const { tableId, timer } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_TIMER, { timer });
        break;
      }
      case ServerInternalEvents.GAME_UPDATE: {
        const { tableId, seatNumber, nextPieces, powerBar, board, currentPiece } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_UPDATE, { seatNumber, nextPieces, powerBar, board, currentPiece });
        break;
      }
      case ServerInternalEvents.GAME_OVER: {
        const { tableId, winners, playerResults } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_OVER, { winners, playerResults });
        break;
      }
      case ServerInternalEvents.GAME_POWER_FIRE: {
        const { tableId, sourceUsername, targetUsername, targetSeatNumber, powerItem } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_POWER_FIRE, {
          sourceUsername,
          targetUsername,
          targetSeatNumber,
          powerItem,
        });
        break;
      }
      case ServerInternalEvents.GAME_HOO_SEND_BLOCKS: {
        const { tableId, teamNumber, blocks } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_HOO_SEND_BLOCKS, { tableId, teamNumber, blocks });
        break;
      }
      case ServerInternalEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL: {
        const { tableId, seatNumber, blocks } = data;
        io.to(tableId).emit(ServerToClientEvents.GAME_BLOCKS_MARKED_FOR_REMOVAL, { tableId, seatNumber, blocks });
        break;
      }
      case ServerInternalEvents.PIECE_SPEED: {
        const { tableId, seatNumber } = data;
        io.to(tableId).emit(ServerToClientEvents.PIECE_SPEED, { tableId, seatNumber });
        break;
      }
      case ServerInternalEvents.NOTIFICATION_MARK_AS_READ: {
        const { userId, notification } = data;
        io.to(userId).emit(ServerToClientEvents.NOTIFICATION_MARK_AS_READ, { notification });
        break;
      }
      case ServerInternalEvents.NOTIFICATION_DELETE: {
        const { userId, notificationId } = data;
        io.to(userId).emit(ServerToClientEvents.NOTIFICATION_DELETE, { notificationId });
        break;
      }
    }
  });
}
