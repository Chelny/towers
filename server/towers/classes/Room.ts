import { createId } from "@paralleldrive/cuid2"
import { SocketEvents } from "@/constants/socket-events"
import { TableType } from "@/enums/table-type"
import { TowersGameState } from "@/enums/towers-game-state"
import { logger } from "@/lib/logger"
import { RoomChat, RoomChatPlainObject } from "@/server/towers/classes/RoomChat"
import { ServerTowersSeat, ServerTowersTeam, Table, TablePlainObject } from "@/server/towers/classes/Table"
import { TableSeat } from "@/server/towers/classes/TableSeat"
import { User, UserPlainObject } from "@/server/towers/classes/User"

export enum RoomLevel {
  SOCIAL = "SOCIAL",
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export interface RoomPlainObject {
  id: string
  name: string
  level: RoomLevel
  isFull: boolean
  tables: TablePlainObject[]
  users: UserPlainObject[]
  chat?: RoomChatPlainObject
}

export const ROOM_MAX_USERS_CAPACITY = 300

/**
 * Represents a room in the game lobby.
 *
 * Contains tables, users, and chat functionality.
 */
export class Room {
  public id: string = createId()
  public name: string
  public level: RoomLevel
  public isFull: boolean = false
  public tables: Table[] = []
  public users: User[] = []
  public chat: RoomChat

  /**
   * Creates a new room.
   *
   * @param name - Name of the room.
   * @param level - Difficulty or rank level of the room.
   */
  constructor(name: string, level: RoomLevel) {
    this.name = name
    this.level = level
    this.chat = new RoomChat(this.id)
  }

  public canUserAccess(user: User): boolean {
    if (this.users.find((u: User) => u.user.id === user.user.id)) {
      return true
    }

    if (!this.isFull) {
      return true
    }

    return false
  }

  /**
   * Adds a user to the room.
   *
   * @param user - The user to add.
   */
  public join(user: User): void {
    if (this.users.some((u: User) => u.user?.id === user.user?.id)) {
      return
    }

    if (this.users.length >= ROOM_MAX_USERS_CAPACITY) {
      throw new Error(`The room ${this.name} is full.`)
    }

    user.socket.join(this.id)
    this.users.push(user)
    this.updateIsFull()

    // Update room's users count and data and table's users to invite
    user.io.emit(SocketEvents.ROOMS_LIST_UPDATED)
    user.socket.to(this.id).emit(SocketEvents.ROOM_DATA_UPDATED)
    user.socket.to(this.id).emit(SocketEvents.TABLE_DATA_UPDATED)
    logger.debug(`${user.user?.username} has joined the room ${this.name}.`)

    user.joinRoom(this.id)
  }

  /**
   * Removes a user from the room.
   *
   * @param user - The user to remove.
   */
  public leave(user: User): void {
    if (!this.users.some((u: User) => u.user?.id === user.user?.id)) {
      return
    }

    // Remove user from all tables they are in
    this.tables
      .filter((table: Table) => table.users.some((u: User) => u.user.id === user.user.id))
      .forEach((table: Table) => {
        table.leave(user)
        user.tableInvitationManager.clearInvitations()
      })

    this.users = this.users.filter((u: User) => u.user?.id !== user.user?.id)
    this.updateIsFull()

    // Update room's users count and data and table's users to invite
    user.io.emit(SocketEvents.ROOMS_LIST_UPDATED)
    user.socket.to(this.id).emit(SocketEvents.ROOM_DATA_UPDATED)
    user.socket.to(this.id).emit(SocketEvents.TABLE_DATA_UPDATED)
    logger.debug(`${user.user?.username} has left the room ${this.name}.`)

    user.socket.leave(this.id)
    user.leaveRoom(this.id)
  }

  /**
   * Creates a new table, reusing an available number.
   *
   * @param tableType - The type of the table (public, protected, private).
   * @param isRated - Whether the table is rated (default: true).
   * @returns The newly created table instance.
   */
  public createTable(tableType: TableType = TableType.PUBLIC, isRated: boolean = true): Table {
    const availableNumber: number = this.getNextAvailableTableNumber()
    const table: Table = new Table(this, availableNumber, tableType, isRated)

    table.remove(() => {
      this.removeTable(table)
    })

    this.tables.push(table)

    const user: User | undefined = this.users.find((u: User) => u?.io)
    if (user) {
      user.io.to(this.id).emit(SocketEvents.ROOM_TABLE_ADDED)
    }

    return table
  }

  /**
   * Finds the next available table number.
   *
   * @returns The next available number.
   */
  private getNextAvailableTableNumber(): number {
    const takenNumbers: number[] = this.tables.map((table: Table) => table.tableNumber)

    for (let i = 1; i <= takenNumbers.length + 1; i++) {
      if (!takenNumbers.includes(i)) return i
    }

    return 1
  }

  /**
   * Removes a table from the room.
   *
   * @param table - The table to remove.
   */
  public removeTable(table: Table): void {
    this.tables = this.tables.filter((t: Table) => t.id !== table.id)
  }

  /**
   * Auto-seats a user in a random public table within the room.
   *
   * - Prioritizes tables that are public, not playing, and have fewer players.
   * - If no eligible table exists, creates a new one.
   * - Chooses a random empty seat, prioritizing teams that have no users seated.
   * - If multiple seats qualify, selects one at random to balance teams.
   *
   * @param user - The user to be seated.
   * @returns The ID of the table the user joined.
   * @throws If no empty seat is available.
   */
  public playNow(user: User): string {
    const publicTables: Table[] = this.tables.filter((table: Table) => {
      return (
        table.tableType === TableType.PUBLIC &&
        table.game.state !== TowersGameState.PLAYING &&
        !table.users.some((u: User) => u.user.id === user.user.id)
      )
    })

    // Sort tables by lowest number of seated users (prefer emptier tables)
    const sortedTables = publicTables.sort((a: Table, b: Table) => {
      const aSeated: number = a.seats.filter((s: TableSeat) => s.occupiedBy !== null).length
      const bSeated: number = b.seats.filter((s: TableSeat) => s.occupiedBy !== null).length
      return aSeated - bSeated
    })

    let choosenTable: Table = sortedTables[0]

    if (!choosenTable) {
      // If no tables available, create one
      choosenTable = this.createTable(TableType.PUBLIC)
    }

    const teams: ServerTowersTeam[] = choosenTable.getStructuredTeams()

    // 1. Find teams with no users seated (team is fully empty)
    const emptyTeamSeats = teams
      .filter((team: ServerTowersTeam) =>
        team.seats.every((seat: ServerTowersSeat) => typeof seat.occupiedBy === "undefined"),
      )
      .flatMap((team: ServerTowersTeam) => team.seats)

    // 2. Fallback: find all other empty seats
    const emptySeats = teams
      .flatMap((team: ServerTowersTeam) => team.seats)
      .filter((seat: ServerTowersSeat) => typeof seat.occupiedBy === "undefined")

    const preferredSeats: ServerTowersSeat[] = emptyTeamSeats.length > 0 ? emptyTeamSeats : emptySeats

    if (preferredSeats.length === 0) {
      throw new Error(`No empty seats available at table #${choosenTable.tableNumber}.`)
    }

    const preferredSeatOrder: number[] = [1, 3, 5, 7, 2, 4, 6, 8]

    // Filter seats by priority order
    const orderedPreferredSeats = preferredSeatOrder
      .map((seatNumber: number) => preferredSeats.find((seat: ServerTowersSeat) => seat.seatNumber === seatNumber))
      .filter((seat: ServerTowersSeat | undefined): seat is ServerTowersSeat => seat !== undefined)

    if (orderedPreferredSeats.length === 0) {
      throw new Error(`No empty seats available at table #${choosenTable.tableNumber}.`)
    }

    // Pick the first available seat from the priority list
    const selectedSeat: ServerTowersSeat = orderedPreferredSeats[0]

    choosenTable.join(user, selectedSeat.seatNumber)

    return choosenTable.id
  }

  private updateIsFull(): void {
    this.isFull = this.users.length >= ROOM_MAX_USERS_CAPACITY
  }

  public toPlainObject(user: User): RoomPlainObject {
    const currentUser: User | undefined = this.users.find((u: User) => u.user.id === user.user.id)
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      isFull: this.isFull,
      tables: this.tables.map((table: Table) => table.toPlainObject(user)),
      users: this.users.map((user: User) => user.toPlainObject()),
      chat: currentUser ? this.chat.toPlainObject(currentUser) : undefined,
    }
  }
}
