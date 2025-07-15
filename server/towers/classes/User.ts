import { DisconnectReason, Server, Socket } from "socket.io"
import { DEFAULT_TOWERS_CONTROL_KEYS } from "@/constants/game"
import { SocketEvents } from "@/constants/socket-events"
import { TableType } from "@/enums/table-type"
import { TowersControlKeys } from "@/enums/towers-control-keys"
import { Session } from "@/lib/auth-client"
import {
  TableInvitationManager,
  TableInvitationManagerPlainObject,
} from "@/server/towers/classes/TableInvitationManager"
import { UserMuteManager, UserMuteManagerPlainObject } from "@/server/towers/classes/UserMuteManager"
import { UserStats, UserStatsPlainObject } from "@/server/towers/classes/UserStats"
import { getTeamNumberFromSeatNumber } from "@/server/towers/utils/table"

export interface UserPlainObject {
  user: Session["user"] | null
  controlKeys: TowersControlKeys
  stats: UserStatsPlainObject
  mute: UserMuteManagerPlainObject
  tableInvitations: TableInvitationManagerPlainObject
  lastActiveAt?: number
  rooms: Record<string, UserRoom>
  tables: Record<string, UserTable>
  lastJoinedTable?: UserTable
}

export interface UserRoom {
  createdAt: number
  updatedAt?: number
}

export interface UserTable {
  id: string
  roomId: string
  tableNumber: number
  tableType: TableType
  seatNumber?: number
  teamNumber?: number
  isReady: boolean
  isPlaying: boolean
  createdAt: number
  updatedAt?: number
}

/**
 * Represents a connected user in the game.
 *
 * Holds session data, socket, control keys, readiness state, and gameplay stats.
 */
export class User {
  public io: Server
  public socket: Socket
  public user: Session["user"]
  public controlKeys: TowersControlKeys
  public stats: UserStats
  public tableInvitationManager: TableInvitationManager
  public muteManager: UserMuteManager = new UserMuteManager()
  public lastActiveAt?: number
  private rooms: Map<string, UserRoom> = new Map<string, UserRoom>()
  private tables: Map<string, UserTable> = new Map<string, UserTable>()
  private onGetControlKeys: () => void = this.handleGetControlKeys.bind(this)
  private onSaveControlKeys: (data: { controlKeys: TowersControlKeys }) => void = this.handleSaveControlKeys.bind(this)
  private onPing: () => void = this.handlePing.bind(this)

  constructor(io: Server, socket: Socket, user: Session["user"]) {
    this.io = io
    this.socket = socket
    this.user = user
    this.controlKeys = DEFAULT_TOWERS_CONTROL_KEYS
    this.stats = new UserStats()
    this.tableInvitationManager = new TableInvitationManager(user?.id)
    this.registerSocketListeners()
  }

  private registerSocketListeners(): void {
    this.socket.on(SocketEvents.GAME_GET_CONTROL_KEYS, this.onGetControlKeys)
    this.socket.on(SocketEvents.GAME_SAVE_CONTROL_KEYS, this.onSaveControlKeys)
    this.socket.on(SocketEvents.PING, this.onPing)

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

  private cleanupSocketListeners(): void {
    this.socket.off(SocketEvents.GAME_GET_CONTROL_KEYS, this.onGetControlKeys)
    this.socket.off(SocketEvents.GAME_SAVE_CONTROL_KEYS, this.onSaveControlKeys)
    this.socket.off(SocketEvents.PING, this.onPing)
  }

  private handleGetControlKeys(): void {
    this.socket.emit(SocketEvents.GAME_CONTROL_KEYS, { controlKeys: this.controlKeys })
  }

  private handleSaveControlKeys({ controlKeys }: { controlKeys: TowersControlKeys }): void {
    this.controlKeys = controlKeys
    this.socket.emit(SocketEvents.GAME_CONTROL_KEYS, { controlKeys })
  }

  private handlePing(): void {
    this.lastActiveAt = Date.now()
  }

  public joinRoom(roomId: string): void {
    if (!this.isInRoom(roomId)) {
      this.rooms.set(roomId, { createdAt: Date.now() })
      this.lastActiveAt = Date.now()
    }
  }

  public isInRoom(roomId: string): boolean {
    return this.rooms.has(roomId)
  }

  public updateJoinedRoom(roomId: string, roomInfo: Partial<UserRoom>): void {
    const room: UserRoom | undefined = this.rooms.get(roomId)
    if (!room) return

    room.updatedAt = Date.now()
    Object.assign(room, roomInfo)
    this.lastActiveAt = Date.now()
  }

  public leaveRoom(roomId: string): void {
    if (this.isInRoom(roomId)) {
      this.rooms.delete(roomId)
      this.lastActiveAt = Date.now()
    }
  }

  public joinTable(tableId: string, tableInfo: Partial<UserTable>): void {
    if (!this.isInTable(tableId)) {
      const joinedTable: UserTable = {
        ...tableInfo,
        teamNumber: getTeamNumberFromSeatNumber(tableInfo.seatNumber),
        isReady: false,
        isPlaying: false,
        createdAt: Date.now(),
      } as UserTable

      this.tables.set(tableId, joinedTable)
      this.lastActiveAt = Date.now()
    }
  }

  public isInTable(tableId: string): boolean {
    return this.tables.has(tableId) ?? false
  }

  private getJoinedTable(tableId: string): UserTable | undefined {
    return this.tables.get(tableId)
  }

  public getTableNumber(tableId: string): number | undefined {
    return this.getJoinedTable(tableId)?.tableNumber
  }

  public getSeatNumber(tableId: string): number | undefined {
    return this.getJoinedTable(tableId)?.seatNumber
  }

  public getTeamNumber(tableId: string): number | undefined {
    return this.getJoinedTable(tableId)?.teamNumber
  }

  public isReadyInTable(tableId: string): boolean {
    return this.getJoinedTable(tableId)?.isReady ?? false
  }

  public isPlayingInTable(tableId: string): boolean {
    return this.getJoinedTable(tableId)?.isPlaying ?? false
  }

  public updateJoinedTable(tableId: string, tableInfo: Partial<UserTable>): void {
    const table: UserTable | undefined = this.tables.get(tableId)
    if (!table) return

    if (typeof tableInfo.seatNumber !== "undefined") {
      tableInfo.teamNumber = getTeamNumberFromSeatNumber(tableInfo.seatNumber)
    }

    table.updatedAt = Date.now()
    Object.assign(table, tableInfo)
    this.lastActiveAt = Date.now()
  }

  public leaveTable(tableId: string): void {
    if (this.isInTable(tableId)) {
      this.tables.delete(tableId)
      this.lastActiveAt = Date.now()
    }
  }

  public canWatch(target: User): UserTable | null {
    const targetTable: UserTable | undefined = Array.from(target.tables.values()).find(
      (table: UserTable) => table.isPlaying,
    )
    if (!targetTable) return null

    const alreadyAtSameTable: boolean = Array.from(this.tables.values()).some(
      (table: UserTable) => table.roomId === targetTable.roomId && table.tableNumber === targetTable.tableNumber,
    )

    if (alreadyAtSameTable) return null

    if (targetTable.tableType === TableType.PRIVATE) return null

    return targetTable
  }

  public toPlainObject(): UserPlainObject {
    const tables: UserTable[] = Array.from(this.tables.values())
    const lastJoinedTable: UserTable | undefined =
      tables.length > 0 ? tables.sort((a: UserTable, b: UserTable) => b.createdAt - a.createdAt)[0] : undefined

    return {
      user: this.user,
      controlKeys: this.controlKeys,
      stats: this.stats.toPlainObject(),
      mute: this.muteManager.toPlainObject(),
      tableInvitations: this.tableInvitationManager.toPlainObject(),
      lastActiveAt: this.lastActiveAt,
      rooms: Object.fromEntries(this.rooms.entries()),
      tables: Object.fromEntries(this.tables.entries()),
      lastJoinedTable,
    }
  }
}
