import { TableChatMessageType } from "db";
import { TableType } from "db";
import { DisconnectReason, Server, Socket } from "socket.io";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { SocketCallback } from "@/interfaces/socket";
import { Conversation } from "@/server/towers/classes/Conversation";
import { ConversationParticipant } from "@/server/towers/classes/ConversationParticipant";
import { Notification } from "@/server/towers/classes/Notification";
import { PlayerControlKeys, PlayerControlKeysPlainObject } from "@/server/towers/classes/PlayerControlKeys";
import { Room } from "@/server/towers/classes/Room";
import { RoomPlayer } from "@/server/towers/classes/RoomPlayer";
import { Table } from "@/server/towers/classes/Table";
import { TableChatMessageVariables } from "@/server/towers/classes/TableChatMessage";
import { TablePlayer } from "@/server/towers/classes/TablePlayer";
import { User } from "@/server/towers/classes/User";
import { ConversationManager } from "@/server/towers/managers/ConversationManager";
import { ConversationParticipantManager } from "@/server/towers/managers/ConversationPartiticpantManager";
import { InstantMessageManager } from "@/server/towers/managers/InstantMessageManager";
import { NotificationManager } from "@/server/towers/managers/NotificationManager";
import { PlayerControlKeysManager } from "@/server/towers/managers/PlayerControlKeysManager";
import { PlayerManager } from "@/server/towers/managers/PlayerManager";
import { RoomManager } from "@/server/towers/managers/RoomManager";
import { TableInvitationManager } from "@/server/towers/managers/TableInvitationManager";
import { TableManager } from "@/server/towers/managers/TableManager";
import { TablePlayerManager } from "@/server/towers/managers/TablePlayerManager";
import { UserManager } from "@/server/towers/managers/UserManager";
import { UserMuteManager } from "@/server/towers/managers/UserMuteManager";

export class TowersSocketHandler {
  constructor(
    private io: Server,
    private socket: Socket,
    private user: User,
  ) {}

  public registerSocketListeners(): void {
    this.socket.on(ClientToServerEvents.USER_MUTES, this.handleGetMutedUsers);
    this.socket.on(ClientToServerEvents.USER_MUTE_CHECK, this.handleCheckUserMuted);
    this.socket.on(ClientToServerEvents.USER_MUTE, this.handleMuteUser);
    this.socket.on(ClientToServerEvents.USER_UNMUTE, this.handleUnmuteUser);
    this.socket.on(ClientToServerEvents.PING_REQUEST, this.handlePingUser);

    this.socket.on(ClientToServerEvents.CONVERSATIONS, this.handleGetConversations);
    this.socket.on(ClientToServerEvents.CONVERSATIONS_UNREAD, this.handleGetUnreadConversations);
    this.socket.on(ClientToServerEvents.CONVERSATION, this.handleGetConversation);
    this.socket.on(ClientToServerEvents.CONVERSATION_MARK_AS_READ, this.handleMarkConversationAsRead);
    this.socket.on(ClientToServerEvents.CONVERSATION_MUTE, this.handleMuteConversation);
    this.socket.on(ClientToServerEvents.CONVERSATION_UNMUTE, this.handleUnmuteConversation);
    this.socket.on(ClientToServerEvents.CONVERSATION_REMOVE, this.handleRemoveConversation);
    this.socket.on(ClientToServerEvents.CONVERSATION_MESSAGE_SEND, this.handleSendInstantMessage);

    this.socket.on(ClientToServerEvents.ROOM_JOIN, this.handleJoinRoom);
    this.socket.on(ClientToServerEvents.ROOM_LEAVE, this.handleLeaveRoom);
    this.socket.on(ClientToServerEvents.ROOM_MESSAGE_SEND, this.handleSendRoomMessage);

    this.socket.on(ClientToServerEvents.TABLE_JOIN, this.handleJoinTable);
    this.socket.on(ClientToServerEvents.TABLE_LEAVE, this.handleLeaveTable);
    this.socket.on(ClientToServerEvents.TABLE_PLAY_NOW, this.handlePlayNow);
    this.socket.on(ClientToServerEvents.TABLE_CREATE, this.handleCreateTable);
    this.socket.on(ClientToServerEvents.TABLE_UPDATE_SETTINGS, this.handleUpdateTableSettings);
    this.socket.on(ClientToServerEvents.TABLE_MESSAGE_SEND, this.handleSendTableMessage);
    this.socket.on(ClientToServerEvents.TABLE_PLAYERS_TO_INVITE, this.handlePlayersToInvite);
    this.socket.on(ClientToServerEvents.TABLE_INVITE_USER, this.handleInviteUserToTable);
    this.socket.on(ClientToServerEvents.TABLE_INVITATION_ACCEPTED_CHECK, this.handleCheckAcceptedTableInvitation);
    this.socket.on(ClientToServerEvents.TABLE_INVITATION_ACCEPTED, this.handleAcceptedTableInvitation);
    this.socket.on(ClientToServerEvents.TABLE_INVITATION_DECLINED, this.handleDeclinedTableInvitation);
    this.socket.on(ClientToServerEvents.TABLE_PLAYERS_TO_BOOT, this.handlePlayersToBoot);
    this.socket.on(ClientToServerEvents.TABLE_BOOT_USER, this.handleBootUserFromTable);
    this.socket.on(ClientToServerEvents.TABLE_TYPED_HERO_CODE, this.handleHeroCode);

    this.socket.on(ClientToServerEvents.SEAT_SIT, this.handleSeatSit);
    this.socket.on(ClientToServerEvents.SEAT_STAND, this.handleSeatStand);
    this.socket.on(ClientToServerEvents.SEAT_READY, this.handleSeatReady);

    this.socket.on(ClientToServerEvents.GAME_CONTROL_KEYS, this.handleGetControlKeys);
    this.socket.on(ClientToServerEvents.GAME_CONTROL_KEYS_UPDATE, this.handleUpdateControlKeys);
    this.socket.on(ClientToServerEvents.GAME_WATCH_USER_AT_TABLE, this.handleWatchUserAtTable);

    this.socket.on(ClientToServerEvents.NOTIFICATIONS, this.handleGetNotifications);
    this.socket.on(ClientToServerEvents.NOTIFICATION_MARK_AS_READ, this.handleMarkNotificationAsRead);
    this.socket.on(ClientToServerEvents.NOTIFICATION_DELETE, this.handleDeleteNotification);

    this.socket.on("disconnect", (reason: DisconnectReason) => {
      const shouldCleanup: boolean =
        reason === "forced close" ||
        reason === "server shutting down" ||
        reason === "forced server close" ||
        reason === "client namespace disconnect" ||
        reason === "server namespace disconnect";

      if (shouldCleanup) {
        this.cleanupSocketListeners();
      }
    });
  }

  private cleanupSocketListeners(): void {
    this.socket.off(ClientToServerEvents.USER_MUTES, this.handleGetMutedUsers);
    this.socket.off(ClientToServerEvents.USER_MUTE_CHECK, this.handleCheckUserMuted);
    this.socket.off(ClientToServerEvents.USER_MUTE, this.handleMuteUser);
    this.socket.off(ClientToServerEvents.USER_UNMUTE, this.handleUnmuteUser);
    this.socket.off(ClientToServerEvents.PING_REQUEST, this.handlePingUser);

    this.socket.off(ClientToServerEvents.CONVERSATIONS, this.handleGetConversations);
    this.socket.off(ClientToServerEvents.CONVERSATIONS_UNREAD, this.handleGetUnreadConversations);
    this.socket.off(ClientToServerEvents.CONVERSATION, this.handleGetConversation);
    this.socket.off(ClientToServerEvents.CONVERSATION_MARK_AS_READ, this.handleMarkConversationAsRead);
    this.socket.off(ClientToServerEvents.CONVERSATION_MUTE, this.handleMuteConversation);
    this.socket.off(ClientToServerEvents.CONVERSATION_UNMUTE, this.handleUnmuteConversation);
    this.socket.off(ClientToServerEvents.CONVERSATION_REMOVE, this.handleRemoveConversation);
    this.socket.off(ClientToServerEvents.CONVERSATION_MESSAGE_SEND, this.handleSendInstantMessage);

    this.socket.off(ClientToServerEvents.ROOM_JOIN, this.handleJoinRoom);
    this.socket.off(ClientToServerEvents.ROOM_LEAVE, this.handleLeaveRoom);
    this.socket.off(ClientToServerEvents.ROOM_MESSAGE_SEND, this.handleSendRoomMessage);

    this.socket.off(ClientToServerEvents.TABLE_JOIN, this.handleJoinTable);
    this.socket.off(ClientToServerEvents.TABLE_LEAVE, this.handleLeaveTable);
    this.socket.off(ClientToServerEvents.TABLE_PLAY_NOW, this.handlePlayNow);
    this.socket.off(ClientToServerEvents.TABLE_CREATE, this.handleCreateTable);
    this.socket.off(ClientToServerEvents.TABLE_UPDATE_SETTINGS, this.handleUpdateTableSettings);
    this.socket.off(ClientToServerEvents.TABLE_MESSAGE_SEND, this.handleSendTableMessage);
    this.socket.off(ClientToServerEvents.TABLE_PLAYERS_TO_INVITE, this.handlePlayersToInvite);
    this.socket.off(ClientToServerEvents.TABLE_INVITE_USER, this.handleInviteUserToTable);
    this.socket.off(ClientToServerEvents.TABLE_INVITATION_ACCEPTED_CHECK, this.handleCheckAcceptedTableInvitation);
    this.socket.off(ClientToServerEvents.TABLE_INVITATION_ACCEPTED, this.handleAcceptedTableInvitation);
    this.socket.off(ClientToServerEvents.TABLE_INVITATION_DECLINED, this.handleDeclinedTableInvitation);
    this.socket.off(ClientToServerEvents.TABLE_PLAYERS_TO_BOOT, this.handlePlayersToBoot);
    this.socket.off(ClientToServerEvents.TABLE_BOOT_USER, this.handleBootUserFromTable);
    this.socket.off(ClientToServerEvents.TABLE_TYPED_HERO_CODE, this.handleHeroCode);

    this.socket.off(ClientToServerEvents.SEAT_SIT, this.handleSeatSit);
    this.socket.off(ClientToServerEvents.SEAT_STAND, this.handleSeatStand);
    this.socket.off(ClientToServerEvents.SEAT_READY, this.handleSeatReady);

    this.socket.off(ClientToServerEvents.GAME_CONTROL_KEYS, this.handleGetControlKeys);
    this.socket.off(ClientToServerEvents.GAME_CONTROL_KEYS_UPDATE, this.handleUpdateControlKeys);
    this.socket.off(ClientToServerEvents.GAME_WATCH_USER_AT_TABLE, this.handleWatchUserAtTable);

    this.socket.off(ClientToServerEvents.NOTIFICATIONS, this.handleGetNotifications);
    this.socket.off(ClientToServerEvents.NOTIFICATION_MARK_AS_READ, this.handleMarkNotificationAsRead);
    this.socket.off(ClientToServerEvents.NOTIFICATION_DELETE, this.handleDeleteNotification);
  }

  private handleGetMutedUsers = ({}, callback: <T>({ success, message, data }: SocketCallback<T>) => void): void => {
    try {
      const mutedUserIds: string[] = UserMuteManager.mutedUserIdsFor(this.user.id);
      callback({ success: true, data: mutedUserIds });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error getting muted users" });
    }
  };

  private handleCheckUserMuted = async (
    { mutedUserId }: { mutedUserId: string },
    callback: <T>({ success, message, data }: SocketCallback<T>) => void,
  ): Promise<void> => {
    try {
      const isUserMuted: boolean = await UserMuteManager.isMuted(this.user.id, mutedUserId);
      callback({ success: true, data: isUserMuted });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error checking if user is muted" });
    }
  };

  private handleMuteUser = async ({ mutedUserId }: { mutedUserId: string }): Promise<void> => {
    if (!(await UserMuteManager.isMuted(this.user.id, mutedUserId))) {
      const user: User | undefined = UserManager.get(mutedUserId);
      if (!user) throw new Error("User not found");
      UserMuteManager.create({ muterUser: this.user, mutedUser: user });
    }
  };

  private handleUnmuteUser = async ({ mutedUserId }: { mutedUserId: string }): Promise<void> => {
    if (await UserMuteManager.isMuted(this.user.id, mutedUserId)) {
      UserMuteManager.unmute(this.user.id, mutedUserId);
    }
  };

  private handlePingUser = async (
    { userId }: { userId: string },
    callback: <T>({ success, message, data }: SocketCallback<T>) => void,
  ): Promise<void> => {
    const startTime: number = Date.now();

    // Find the target socket
    const sockets = await this.io.fetchSockets();
    const target = sockets.find((socket) => socket.data?.session?.user?.id === userId);

    if (!target) {
      callback({ success: false, message: "Target not found" });
      return;
    }

    try {
      target.timeout(2000).emit(ServerToClientEvents.PING_ECHO, {}, (err: unknown, ok: boolean) => {
        if (err || !ok) {
          callback({ success: false, message: "Ping failed" });
          return;
        }

        const roundTrip: number = Date.now() - startTime;
        callback({ success: true, message: "Ping successfully sent back!", data: { roundTrip } });
      });
    } catch {
      callback({ success: false, message: "Unexpected error" });
    }
  };

  private handleGetConversations = ({}, callback: <T>({ success, message, data }: SocketCallback<T>) => void): void => {
    try {
      const conversations: Conversation[] = ConversationManager.getAllByUserId(this.user.id);
      callback({ success: true, data: conversations.map((c: Conversation) => c.toPlainObject()) });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error getting conversations" });
    }
  };

  private handleGetUnreadConversations = async (
    {},
    callback: <T>({ success, message, data }: SocketCallback<T>) => void,
  ): Promise<void> => {
    try {
      const unreadConversationsCount: number = ConversationManager.getUnreadConversationsCount(this.user.id);
      callback({ success: true, data: unreadConversationsCount });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error getting unread messages" });
    }
  };

  private handleGetConversation = (
    { conversationId }: { conversationId: string },
    callback: ({ success, message }: SocketCallback) => void,
  ): void => {
    try {
      const conversation: Conversation | undefined = ConversationManager.get(conversationId);
      if (!conversation) throw Error;

      callback({ success: true, data: conversation.toPlainObject() });
    } catch {
      callback({ success: false });
    }
  };

  private handleMarkConversationAsRead = async ({
    conversationId,
    userId,
  }: {
    conversationId: string
    userId: string
  }): Promise<void> => {
    await ConversationManager.markAsRead(conversationId, userId);
  };

  private handleMuteConversation = async ({
    conversationId,
    userId,
  }: {
    conversationId: string
    userId: string
  }): Promise<void> => {
    await ConversationManager.mute(conversationId, userId);
  };

  private handleUnmuteConversation = async ({
    conversationId,
    userId,
  }: {
    conversationId: string
    userId: string
  }): Promise<void> => {
    await ConversationManager.unmute(conversationId, userId);
  };

  private handleRemoveConversation = async ({
    conversationId,
    userId,
  }: {
    conversationId: string
    userId: string
  }): Promise<void> => {
    await ConversationManager.remove(conversationId, userId);
  };

  private handleSendInstantMessage = (
    { conversationId, recipientId, message }: { conversationId?: string; recipientId?: string; message: string },
    callback: ({ success, message }: SocketCallback) => void,
  ): void => {
    try {
      let conversation: Conversation | undefined;

      if (!conversationId) {
        if (recipientId) {
          conversation = ConversationManager.getOrCreateBetweenUsers(this.user.id, recipientId);
        } else {
          throw Error("recipientId not provided");
        }
      } else {
        conversation = ConversationManager.get(conversationId);
      }

      if (!conversation) throw Error("Conversation not found");

      const conversationParticipant: ConversationParticipant | undefined =
        ConversationParticipantManager.getOtherParticipant(conversation.id, this.user.id);
      if (!conversationParticipant) throw Error("Conversation participant not found");

      InstantMessageManager.sendMessage(conversation.id, this.user, conversationParticipant?.user, message);

      callback({ success: true, message: "Message has been sent.", data: conversation.id });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error sending an instant message" });
    }
  };

  private handleJoinRoom = async (
    { roomId }: { roomId: string },
    callback: ({ success, message }: SocketCallback) => void,
  ): Promise<void> => {
    await PlayerManager.loadPlayerFromDb(this.user.id);
    const room: Room | undefined = RoomManager.get(roomId);

    if (room) {
      if (!RoomManager.canUserAccess(room, this.user.id)) {
        callback({ success: false, message: "Room cannot be accessed." });
      } else if (room.players.some((rp: RoomPlayer) => rp.playerId === this.user.id)) {
        callback({
          success: true,
          message: "You are already in the table.",
          data: RoomManager.roomViewForPlayer(room, this.user.id),
        }); // TODO: Remove data when db logic will be implemented
      } else {
        RoomManager.joinRoom(room, this.user);
        callback({
          success: true,
          message: "You joined the room.",
          data: RoomManager.roomViewForPlayer(room, this.user.id),
        }); // TODO: Remove data when db logic will be implemented
      }
    } else {
      callback({ success: false, message: "Room not found." });
    }
  };

  private handleLeaveRoom = (
    { roomId }: { roomId: string },
    callback: ({ success, message }: SocketCallback) => void,
  ): void => {
    const room: Room | undefined = RoomManager.get(roomId);

    if (room) {
      if (!room.players.some((rp: RoomPlayer) => rp.playerId === this.user.id)) {
        callback({ success: true, message: "You are not in the room." });
      } else {
        RoomManager.leaveRoom(room, this.user);
        callback({ success: true, message: "You left the room." });
      }
    } else {
      callback({ success: false, message: "Room not found." });
    }
  };

  private handleSendRoomMessage = async (
    { roomId, text }: { roomId: string; text: string },
    callback: ({ success }: SocketCallback) => void,
  ): Promise<void> => {
    try {
      await RoomManager.sendMessage(roomId, this.user.id, text);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error sending message" });
    }
  };

  private handleJoinTable = async (
    { tableId, seatNumber }: { tableId: string; seatNumber: number },
    callback: ({ success, message }: SocketCallback) => void,
  ): Promise<void> => {
    await PlayerManager.loadPlayerFromDb(this.user.id);
    const table: Table | undefined = TableManager.get(tableId);

    if (table) {
      if (!TableManager.canUserAccess(table, this.user.id)) {
        callback({ success: false, message: "Table cannot be accessed." });
      } else if (table.players.some((tp: TablePlayer) => tp.playerId === this.user.id)) {
        callback({
          success: true,
          message: "You are already in the table.",
          data: TableManager.tableViewForPlayer(table, this.user.id),
        }); // TODO: Remove data when db logic will be implemented
      } else {
        TableManager.joinTable(table, this.user, seatNumber);
        callback({
          success: true,
          message: "You joined the table.",
          data: TableManager.tableViewForPlayer(table, this.user.id),
        }); // TODO: Remove data when db logic will be implemented
      }
    } else {
      callback({ success: false, message: "Table not found." });
    }
  };

  private handleLeaveTable = (
    { tableId }: { tableId: string },
    callback: ({ success, message }: SocketCallback) => void,
  ): void => {
    const table: Table | undefined = TableManager.get(tableId);

    if (table) {
      if (!table.players.some((tp: TablePlayer) => tp.playerId === this.user.id)) {
        callback({ success: true, message: "You are not in the table." });
      } else {
        TableManager.leaveTable(table, this.user);
        callback({ success: true, message: "You left the table." });
      }
    } else {
      callback({ success: false, message: "Table not found." });
    }
  };

  private handlePlayNow = (
    { roomId }: { roomId: string },
    callback: <T>({ success, message, data }: SocketCallback<T>) => void,
  ): void => {
    try {
      const tableId: string = RoomManager.playNow(roomId, this.user);
      callback({ success: true, message: "User joined a table.", data: { tableId } });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error entering random table" });
    }
  };

  private handleCreateTable = (
    {
      roomId,
      hostPlayerId,
      tableType,
      isRated,
    }: { roomId: string; hostPlayerId: string; tableType: TableType; isRated: boolean },
    callback: <T>({ success, message, data }: SocketCallback<T>) => void,
  ): void => {
    try {
      const table: Table | undefined = RoomManager.createTable(roomId, hostPlayerId, tableType, isRated);
      callback({ success: true, message: "Table created.", data: { tableId: table.id } });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Failed to create table." });
    }
  };

  private handleUpdateTableSettings = async ({
    tableId,
    tableType,
    isRated,
  }: {
    tableId: string
    tableType: TableType
    isRated: boolean
  }): Promise<void> => {
    await TableManager.updateTableOptions(tableId, this.user.id, { tableType, isRated });
  };

  private handleSendTableMessage = async (
    {
      tableId,
      text,
      type = TableChatMessageType.CHAT,
      textVariables,
      visibleToUserId,
    }: {
      tableId: string
      text: string
      type: TableChatMessageType
      textVariables: TableChatMessageVariables
      visibleToUserId: string
    },
    callback: ({ success }: SocketCallback) => void,
  ): Promise<void> => {
    try {
      await TableManager.sendMessage(tableId, this.user.id, text, type, textVariables, visibleToUserId);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error sending message" });
    }
  };

  private handlePlayersToInvite = (
    { tableId }: { tableId: string },
    callback: ({ success }: SocketCallback) => void,
  ): void => {
    try {
      const roomPlayers: RoomPlayer[] = TableManager.getPlayersToInvite(tableId);
      callback({ success: true, data: roomPlayers.map((rp: RoomPlayer) => rp.toPlainObject()) });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error loading players to invite" });
    }
  };

  private handleInviteUserToTable = async (
    { tableId, inviterId, inviteeId }: { tableId: string; inviterId: string; inviteeId: string },
    callback: ({ success }: SocketCallback) => void,
  ): Promise<void> => {
    try {
      await TableManager.invitePlayer(tableId, inviterId, inviteeId);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error inviting user to table" });
    }
  };

  private handleCheckAcceptedTableInvitation = (
    { tableId, playerId }: { tableId: string; playerId: string },
    callback: ({ success }: SocketCallback) => void,
  ): void => {
    try {
      const hasAcceptedInvitation: boolean = TableInvitationManager.hasAcceptedInvitationForTable(tableId, playerId);
      callback({ success: true, data: hasAcceptedInvitation });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error loading players to invite" });
    }
  };

  private handleAcceptedTableInvitation = async (
    { invitationId }: { invitationId: string },
    callback: ({ success }: SocketCallback) => void,
  ): Promise<void> => {
    try {
      await TableInvitationManager.accept(invitationId);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error accepting the invite" });
    }
  };

  private handleDeclinedTableInvitation = async (
    { invitationId, reason, isDeclineAll }: { invitationId: string; reason: string | null; isDeclineAll: boolean },
    callback: ({ success }: SocketCallback) => void,
  ): Promise<void> => {
    try {
      await TableInvitationManager.decline(invitationId, reason, isDeclineAll);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error declining table invitation" });
    }
  };

  private handlePlayersToBoot = (
    { tableId }: { tableId: string },
    callback: ({ success }: SocketCallback) => void,
  ): void => {
    try {
      const tablePlayers: TablePlayer[] = TableManager.getPlayersToBoot(tableId);
      callback({ success: true, data: tablePlayers.map((tp: TablePlayer) => tp.toPlainObject()) });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error loading players to boot" });
    }
  };

  private handleBootUserFromTable = async (
    { tableId, hostId, playerToBootId }: { tableId: string; hostId: string; playerToBootId: string },
    callback: ({ success }: SocketCallback) => void,
  ): Promise<void> => {
    try {
      await TableManager.bootPlayer(tableId, hostId, playerToBootId);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error instanceof Error ? error.message : "Error booting user" });
    }
  };

  private handleHeroCode = async ({ tableId, code }: { tableId: string; code: string }): Promise<void> => {
    await TableManager.heroCode(tableId, this.user.id, code);
  };

  private handleSeatSit = async ({ tableId, seatNumber }: { tableId: string; seatNumber: number }): Promise<void> => {
    await TableManager.sitPlayer(tableId, this.user.id, seatNumber);
  };

  private handleSeatStand = async ({ tableId }: { tableId: string }): Promise<void> => {
    await TableManager.standPlayer(tableId, this.user.id);
  };

  private handleSeatReady = async ({ tableId }: { tableId: string }): Promise<void> => {
    await TableManager.setPlayerReady(tableId, this.user.id);
  };

  private handleGetControlKeys = (
    { playerId }: { playerId: string },
    callback: ({ success, message, data }: SocketCallback) => void,
  ): void => {
    const controlKeys: PlayerControlKeys | undefined = PlayerControlKeysManager.getByPlayerId(playerId);

    if (controlKeys) {
      callback({ success: true, data: controlKeys.toPlainObject() });
    } else {
      callback({ success: false });
    }
  };

  private handleUpdateControlKeys = async ({
    controlKeys,
  }: {
    controlKeys: PlayerControlKeysPlainObject
  }): Promise<void> => {
    await PlayerControlKeysManager.upsert(controlKeys);
    PlayerManager.updateLastActiveAt(controlKeys.playerId);
  };

  private handleWatchUserAtTable = (
    { roomId, userId }: { roomId: string; userId: string },
    callback: ({ success, message, data }: SocketCallback) => void,
  ): void => {
    const canWatch: { roomId: string; tableId: string } | null = TablePlayerManager.canWatchPlayerAtTable(
      this.user.id,
      userId,
    );
    if (!canWatch) return;

    if (roomId && canWatch.tableId) {
      callback({
        success: true,
        message: "You can watch user playing.",
        data: { roomId, tableId: canWatch.tableId },
      });
    } else {
      callback({ success: false, message: "Cannot watch user playing." });
    }
  };

  private handleGetNotifications = ({}, callback: <T>({ success, message, data }: SocketCallback<T>) => void): void => {
    const notification: Notification[] = NotificationManager.getAllByPlayerId(this.user.id);
    callback({ success: true, data: notification.map((n: Notification) => n.toPlainObject()) });
  };

  private handleMarkNotificationAsRead = async ({ notificationId }: { notificationId: string }): Promise<void> => {
    await NotificationManager.markAsRead(notificationId);
  };

  private handleDeleteNotification = async ({ notificationId }: { notificationId: string }): Promise<void> => {
    await NotificationManager.deleteNotification(notificationId, this.user.id);
  };
}
