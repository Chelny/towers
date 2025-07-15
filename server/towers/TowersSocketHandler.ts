import { DisconnectReason, Server, Socket } from "socket.io"
import { SocketEvents } from "@/constants/socket-events"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TableType } from "@/enums/table-type"
import { CipherHeroManager } from "@/server/towers/classes/CipherHeroManager"
import { InstantMessage } from "@/server/towers/classes/InstantMessage"
import { Room } from "@/server/towers/classes/Room"
import { Table } from "@/server/towers/classes/Table"
import { TableChatMessageVariables } from "@/server/towers/classes/TableChat"
import { User, UserTable } from "@/server/towers/classes/User"
import { rooms } from "@/server/towers/room-store"

interface Callback<T = {}> {
  success: boolean
  message: string
  data?: Record<string, T>
}

export class TowersSocketHandler {
  constructor(
    private io: Server,
    private socket: Socket,
    private user: User,
  ) {}

  public registerSocketListeners(): void {
    this.registerRoomSocketListeners()
    this.registerTableSocketListeners()
    this.registerUserSocketListeners()

    this.socket.on("disconnect", (reason: DisconnectReason) => {
      const shouldCleanup: boolean =
        reason === "forced close" ||
        reason === "server shutting down" ||
        reason === "forced server close" ||
        reason === "client namespace disconnect" ||
        reason === "server namespace disconnect"

      if (shouldCleanup) {
        this.cleanupSocketListeners()
      }
    })
  }

  private registerRoomSocketListeners(): void {
    this.socket.on(SocketEvents.ROOM_JOIN, this.handleRoomJoin)
    this.socket.on(SocketEvents.ROOM_LEAVE, this.handleRoomLeave)
    this.socket.on(SocketEvents.ROOM_MESSAGE_SEND, this.handleRoomMessageSend)
    this.socket.on(SocketEvents.ROOM_GET, this.handleRoomGet)
  }

  private registerTableSocketListeners(): void {
    this.socket.on(SocketEvents.TABLE_JOIN, this.handleTableJoin)
    this.socket.on(SocketEvents.TABLE_LEAVE, this.handleTableLeave)
    this.socket.on(SocketEvents.TABLE_PLAY_NOW, this.handlePlayNow)
    this.socket.on(SocketEvents.TABLE_CREATE, this.handleTableCreate)
    this.socket.on(SocketEvents.TABLE_UPDATE_SETTINGS, this.handleTableUpdateSettings)
    this.socket.on(SocketEvents.TABLE_MESSAGE_SEND, this.handleTableMessageSend)
    this.socket.on(SocketEvents.TABLE_GET, this.handleTableGet)
    this.socket.on(SocketEvents.TABLE_INVITE_USER, this.handleTableInviteUser)
    this.socket.on(SocketEvents.TABLE_INVITATION_ACCEPTED, this.handleTableInvitationAccepted)
    this.socket.on(SocketEvents.TABLE_INVITATION_DECLINED, this.handleTableInvitationDeclined)
    this.socket.on(SocketEvents.TABLE_BOOT_USER, this.handleTableBootUser)
    this.socket.on(SocketEvents.TABLE_TYPED_HERO_CODE, this.handleHeroCode)
    this.socket.on(SocketEvents.SEAT_SIT, this.handleSeatSit)
    this.socket.on(SocketEvents.SEAT_STAND, this.handleSeatStand)
    this.socket.on(SocketEvents.SEAT_READY, this.handleSeatReady)
    this.socket.on(SocketEvents.GAME_WATCH_USER_AT_TABLE, this.handleWatchUserAtTable)
  }

  private registerUserSocketListeners(): void {
    this.socket.on(SocketEvents.USER_MUTE, this.handleUserMute)
    this.socket.on(SocketEvents.USER_PING, this.handleUserPing)
    this.socket.on(SocketEvents.INSTANT_MESSAGE_SENT, this.handleInstantMessageSent)
  }

  private cleanupSocketListeners(): void {
    this.socket.off(SocketEvents.ROOM_JOIN, this.handleRoomJoin)
    this.socket.off(SocketEvents.ROOM_LEAVE, this.handleRoomLeave)
    this.socket.off(SocketEvents.ROOM_MESSAGE_SEND, this.handleRoomMessageSend)
    this.socket.off(SocketEvents.ROOM_GET, this.handleRoomGet)

    this.socket.off(SocketEvents.TABLE_JOIN, this.handleTableJoin)
    this.socket.off(SocketEvents.TABLE_LEAVE, this.handleTableLeave)
    this.socket.off(SocketEvents.TABLE_PLAY_NOW, this.handlePlayNow)
    this.socket.off(SocketEvents.TABLE_CREATE, this.handleTableCreate)
    this.socket.off(SocketEvents.TABLE_UPDATE_SETTINGS, this.handleTableUpdateSettings)
    this.socket.off(SocketEvents.TABLE_MESSAGE_SEND, this.handleTableMessageSend)
    this.socket.off(SocketEvents.TABLE_GET, this.handleTableGet)
    this.socket.off(SocketEvents.TABLE_INVITE_USER, this.handleTableInviteUser)
    this.socket.off(SocketEvents.TABLE_INVITATION_ACCEPTED, this.handleTableInvitationAccepted)
    this.socket.off(SocketEvents.TABLE_INVITATION_DECLINED, this.handleTableInvitationDeclined)
    this.socket.off(SocketEvents.TABLE_BOOT_USER, this.handleTableBootUser)
    this.socket.off(SocketEvents.TABLE_TYPED_HERO_CODE, this.handleHeroCode)

    this.socket.off(SocketEvents.SEAT_SIT, this.handleSeatSit)
    this.socket.off(SocketEvents.SEAT_STAND, this.handleSeatStand)
    this.socket.off(SocketEvents.SEAT_READY, this.handleSeatReady)

    this.socket.off(SocketEvents.USER_MUTE, this.handleUserMute)
    this.socket.off(SocketEvents.USER_PING, this.handleUserPing)
    this.socket.on(SocketEvents.INSTANT_MESSAGE_SENT, this.handleInstantMessageSent)
  }

  private handleRoomJoin = (
    { roomId }: { roomId: string },
    callback: ({ success, message }: Callback) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      if (!room.canUserAccess(this.user)) {
        callback({ success: false, message: "Room cannot be accessed." })
      } else if (room.users.some((u: User) => u.user?.id === this.user.user?.id)) {
        callback({ success: true, message: "You are already in the room." })
      } else {
        room.join(this.user)
        callback({ success: true, message: "You joined the room." })
      }
    } else {
      callback({ success: false, message: "Room not found." })
    }
  }

  private handleRoomLeave = (
    { roomId }: { roomId: string },
    callback: ({ success, message }: Callback) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      if (!room.users.some((u: User) => u.user?.id === this.user.user?.id)) {
        callback({ success: true, message: "You are not in the room." })
      } else {
        room.leave(this.user)
        callback({ success: true, message: "You left the room." })
      }
    } else {
      callback({ success: false, message: "Room not found." })
    }
  }

  private handleRoomMessageSend = ({ roomId, text }: { roomId: string; text: string }): void => {
    const room: Room | undefined = rooms.get(roomId)
    if (room) room.chat.addMessage({ user: this.user, text })
  }

  private handleRoomGet = ({ roomId }: { roomId: string }): void => {
    const room: Room | undefined = rooms.get(roomId)
    if (room) this.socket.emit(SocketEvents.ROOM_DATA, { room: room.toPlainObject(this.user) })
  }

  private handleTableJoin = (
    { roomId, tableId, seatNumber }: { roomId: string; tableId: string; seatNumber: number },
    callback: ({ success, message }: Callback) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        if (!table.canUserAccess(this.user)) {
          callback({ success: false, message: "Table cannot be accessed." })
        } else if (table.users.some((u: User) => u.user?.id === this.user.user?.id)) {
          callback({ success: true, message: "You are already in the table." })
        } else {
          table.join(this.user, seatNumber)
          callback({ success: true, message: "You joined the table." })
        }
      } else {
        callback({ success: false, message: "Table not found." })
      }
    }
  }

  private handleTableLeave = (
    { roomId, tableId }: { roomId: string; tableId: string },
    callback: ({ success, message }: Callback) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        if (!table.users.some((u: User) => u.user?.id === this.user.user?.id)) {
          callback({ success: true, message: "You are not in the table." })
        } else {
          table.leave(this.user)
          callback({ success: true, message: "You left the table." })
        }
      } else {
        callback({ success: false, message: "Table not found." })
      }
    }
  }

  private handlePlayNow = (
    { roomId }: { roomId: string },
    callback: <T>({ success, message, data }: Callback<T>) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const tableId: string = room.playNow(this.user)
      callback({ success: true, message: "User joined a table.", data: { tableId } })
    }
  }

  private handleTableCreate = (
    { roomId, tableType, isRated }: { roomId: string; tableType: TableType; isRated: boolean },
    callback: <T>({ success, message, data }: Callback<T>) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.createTable(tableType, isRated)

      if (table) {
        callback({ success: true, message: "Table created.", data: { tableId: table.id } })
      } else {
        callback({ success: false, message: "Failed to create table." })
      }
    }
  }

  private handleTableUpdateSettings = ({
    roomId,
    tableId,
    tableType,
    isRated,
  }: {
    roomId: string
    tableId: string
    tableType: TableType
    isRated: boolean
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        if (table.updateSettings({ tableType, isRated })) {
          this.io.to(tableId).emit(SocketEvents.TABLE_DATA, {
            room: room.toPlainObject(this.user),
            table: table.toPlainObject(this.user),
          })
          this.io.to(roomId).emit(SocketEvents.ROOM_DATA, { room: room.toPlainObject(this.user) })
        }
      }
    }
  }

  private handleTableMessageSend = ({
    roomId,
    tableId,
    text,
    type = TableChatMessageType.CHAT,
    messageVariables,
    visibleToUserId,
  }: {
    roomId: string
    tableId: string
    text: string
    type: TableChatMessageType
    messageVariables: TableChatMessageVariables
    visibleToUserId: string
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        table.chat.addMessage({ user: this.user, text, type, messageVariables, visibleToUserId })
      }
    }
  }

  private handleTableGet = ({ roomId, tableId }: { roomId: string; tableId: string }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        this.socket.emit(SocketEvents.TABLE_DATA, {
          room: room.toPlainObject(this.user),
          table: table.toPlainObject(this.user),
        })
      }
    }
  }

  private handleTableInviteUser = ({
    roomId,
    tableId,
    inviterUserId,
    inviteeUserId,
  }: {
    roomId: string
    tableId: string
    inviterUserId: string
    inviteeUserId: string
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        table.inviteUser(inviterUserId, inviteeUserId)
      }
    }
  }

  private handleTableInvitationAccepted = ({
    roomId,
    tableId,
    inviteeUserId,
  }: {
    roomId: string
    tableId: string
    inviteeUserId: string
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table && inviteeUserId === this.user.user.id) {
        this.user.tableInvitationManager.acceptTableInvitation(table.id)
      }
    }
  }

  private handleTableInvitationDeclined = ({
    roomId,
    tableId,
    inviteeUserId,
    reason,
  }: {
    roomId: string
    tableId: string
    inviteeUserId: string
    reason?: string
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table && inviteeUserId === this.user.user.id) {
        this.user.tableInvitationManager.declineTableInvitation(table.id, reason)
      }
    }
  }

  private handleTableBootUser = ({
    roomId,
    tableId,
    hostId,
    userToBootId,
  }: {
    roomId: string
    tableId: string
    hostId: string
    userToBootId: string
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        table.bootUser(hostId, userToBootId)
      }
    }
  }

  private handleHeroCode = ({ roomId, tableId, code }: { roomId: string; tableId: string; code: string }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table && code && CipherHeroManager.isGuessedCodeMatchesHeroCode(this.user.user.id, code)) {
        table.chat.addMessage({
          user: this.user,
          type: TableChatMessageType.HERO_MESSAGE,
          messageVariables: { username: this.user.user.username },
        })
        CipherHeroManager.removeHeroCode(this.user.user.id)
      }
    }
  }

  private handleSeatSit = ({
    roomId,
    tableId,
    seatNumber,
  }: {
    roomId: string
    tableId: string
    seatNumber: number
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        table.sitUser(this.user, seatNumber)

        this.io.to(tableId).emit(SocketEvents.TABLE_DATA, {
          room: room.toPlainObject(this.user),
          table: table.toPlainObject(this.user),
        })
        this.io.to(roomId).emit(SocketEvents.ROOM_DATA, { room: room.toPlainObject(this.user) })
      }
    }
  }

  private handleSeatStand = ({ roomId, tableId }: { roomId: string; tableId: string }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        table.standUser(this.user)

        this.io.to(tableId).emit(SocketEvents.TABLE_DATA, {
          room: room.toPlainObject(this.user),
          table: table.toPlainObject(this.user),
        })
        this.io.to(roomId).emit(SocketEvents.ROOM_DATA, { room: room.toPlainObject(this.user) })
      }
    }
  }

  private handleSeatReady = ({
    roomId,
    tableId,
    isReady,
  }: {
    roomId: string
    tableId: string
    isReady: boolean
  }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const table: Table | undefined = room.tables.find((t: Table) => t.id === tableId)

      if (table) {
        table.setUserReady(this.user, isReady)

        this.io.to(tableId).emit(SocketEvents.TABLE_DATA, {
          room: room.toPlainObject(this.user),
          table: table.toPlainObject(this.user),
        })
      }
    }
  }

  private handleWatchUserAtTable = (
    { roomId, userId }: { roomId: string; userId: string },
    callback: ({ success, message, data }: Callback) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const user: User | undefined = room.users.find((user: User) => user.user.id === userId)

      if (user) {
        const userTable: UserTable | null = this.user.canWatch(user)

        if (userTable !== null) {
          callback({
            success: true,
            message: "You can watch user playing.",
            data: { roomId: userTable.roomId, tableId: userTable.id },
          })
        } else {
          callback({ success: false, message: "Cannot watch user playing." })
        }
      } else {
        callback({ success: false, message: "User not found." })
      }
    }
  }

  private handleUserMute = ({ userId }: { userId: string }): void => {
    if (this.user.muteManager.isMuted(userId)) {
      this.user.muteManager.unmuteUser(userId)
    } else {
      this.user.muteManager.muteUser(userId)
    }
  }

  private handleUserPing = ({ roomId, userId }: { roomId: string; userId: string }): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const user: User | undefined = room.users.find((user: User) => user.user.id === userId)

      if (user) {
        this.io.to(user.socket.id).emit(SocketEvents.USER_PING_RECEIVED, { fromUsername: user.user.username })
      }
    }
  }

  private handleInstantMessageSent = (
    { roomId, recipientUserId, message }: { roomId: string; recipientUserId: string; message: string },
    callback: ({ success, message }: Callback) => void,
  ): void => {
    const room: Room | undefined = rooms.get(roomId)

    if (room) {
      const recipient: User | undefined = room.users.find((user: User) => user.user.id === recipientUserId)

      if (recipient) {
        const instantMessage: InstantMessage = new InstantMessage(room, this.user, recipient)
        instantMessage.sendInstantMessage(this.user, recipient, message)
        callback({ success: true, message: "Message has been sent." })
      } else {
        callback({ success: false, message: "Recipient not found." })
      }
    } else {
      callback({ success: false, message: "Room not found." })
    }
  }
}
