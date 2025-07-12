import { createId } from "@paralleldrive/cuid2"
import type { Room } from "@/server/towers/classes/Room"
import { SocketEvents } from "@/constants/socket-events"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TableType } from "@/enums/table-type"
import { TowersGameState } from "@/enums/towers-game-state"
import { logger } from "@/lib/logger"
import { Game, GamePlainObject } from "@/server/towers/classes/Game"
import { TableChat, TableChatPlainObject } from "@/server/towers/classes/TableChat"
import { TableInvitation } from "@/server/towers/classes/TableInvitation"
import { TableSeat, TableSeatPlainObject } from "@/server/towers/classes/TableSeat"
import { TableSeatManager } from "@/server/towers/classes/TableSeatManager"
import { User, UserPlainObject } from "@/server/towers/classes/User"

export interface ServerTowersSeat extends TableSeatPlainObject {
  targetNumber: number
}

export interface ServerTowersTeam {
  teamNumber: number
  seats: ServerTowersSeat[]
}

export interface TablePlainObject {
  id: string
  tableNumber: number
  host?: UserPlainObject
  tableType: TableType
  isRated: boolean
  seats: ServerTowersTeam[]
  users: UserPlainObject[]
  usersToInvite: UserPlainObject[]
  usersToBoot: UserPlainObject[]
  chat?: TableChatPlainObject
  game: GamePlainObject
}

/**
 * Represents a game table inside a room.
 *
 * Contains seats, connected users, chat, and manages the game logic and table settings.
 */
export class Table {
  public id: string = createId()
  public room: Room
  public tableNumber: number
  public host?: User
  private _tableType: TableType
  public isRated: boolean
  public seats: TableSeat[]
  public users: User[] = []
  private tableSeatManager: TableSeatManager = new TableSeatManager()
  public chat: TableChat
  public game: Game
  private onRemoveSelf?: () => void

  /**
   * Creates a new table.
   *
   * @param room - The room this table belongs to.
   * @param tableNumber - The number/index of the table in the room.
   * @param tableType - The type of the table (e.g., public or private).
   * @param isRated - Whether the table results are rated.
   */
  constructor(room: Room, tableNumber: number, tableType: TableType = TableType.PUBLIC, isRated: boolean = true) {
    this.room = room
    this.tableNumber = tableNumber
    this._tableType = tableType
    this.isRated = isRated

    this.seats = Array.from({ length: 8 }, (_, i: number) => new TableSeat(this.id, i + 1))
    this.chat = new TableChat(this.id)
    this.game = new Game(this, this.tableSeatManager)
  }

  public set tableType(tableType: TableType) {
    this._tableType = tableType

    if (this.host) {
      this.chat.addMessage({
        user: this.host,
        type: TableChatMessageType.TABLE_TYPE,
        messageVariables: { tableType },
        visibleToUserId: this.host.user.id,
      })
      this.host.io.to(this.id).emit(SocketEvents.TABLE_CHAT_UPDATED)

      switch (tableType) {
        case TableType.PROTECTED:
          logger.debug("Only people you have invited may play now.")
          break
        case TableType.PRIVATE:
          logger.debug("Only people you have invited may play or watch your table now.")
          break
        default:
          logger.debug("Anyone may play or watch your table now.")
      }
    }
  }

  public get tableType(): TableType {
    return this._tableType
  }

  public get usersToInvite(): User[] {
    return this.room.users.filter((user: User) => {
      if (this.tableType === TableType.PROTECTED || this.tableType === TableType.PRIVATE) {
        return (
          user.user.id !== this.host?.user.id && !user.tableInvitationManager.getReceivedInvitationByTableId(this.id)
        )
      } else {
        return !user.isInTable(this.id)
      }
    })
  }

  public get usersToBoot(): User[] {
    return this.users.filter((user: User) => user.user.id !== this.host?.user.id)
  }

  public canUserAccess(user: User): boolean {
    if (this.users.find((u: User) => u.user.id === user.user.id)) {
      return true
    }

    // Allow the first user to access the table — they will become the host
    if (typeof this.host === "undefined" || user.user.id === this.host?.user.id) {
      return true
    }

    if (this.tableType === TableType.PUBLIC || this.tableType === TableType.PROTECTED) {
      return true
    }

    const isInvited: boolean = !!user.tableInvitationManager.getReceivedInvitationByTableId(this.id)

    if (this.tableType === TableType.PRIVATE && isInvited) {
      return true
    }

    return false
  }

  /**
   * Adds a user to the table.
   * @param user - The user to add.
   * @param seatNumber - Optional. The seat number.
   */
  public join(user: User, seatNumber?: number): void {
    if (this.users.some((u: User) => u.user?.id === user.user?.id)) {
      return
    }

    user.socket.join(this.id)

    if (typeof seatNumber !== "undefined") {
      this.sitUser(user, seatNumber)
    }

    this.users.push(user)

    // Announce when user joins table
    this.chat.addMessage({
      user,
      type: TableChatMessageType.USER_JOINED,
      messageVariables: { username: user.user?.username },
    })
    user.io.to(this.id).emit(SocketEvents.TABLE_CHAT_UPDATED)
    logger.debug(`${user.user?.username} has joined table #${this.tableNumber}.`)

    user.io.to(this.room.id).emit(SocketEvents.ROOM_DATA_UPDATED)
    user.socket.to(this.id).emit(SocketEvents.TABLE_DATA_UPDATED)

    // Sync current game state to the new user
    this.game.syncGameStateWithUser(user)

    if (!this.host) {
      this.host = user

      // Announce privately to table host their role
      this.chat.addMessage({ user, type: TableChatMessageType.TABLE_HOST, visibleToUserId: user.user?.id })
      user.io.to(this.id).emit(SocketEvents.TABLE_CHAT_UPDATED)
      logger.debug(
        "You are the host of the table. This gives you the power to invite to [or boot people from] your table. You may also limit other player’s access to your table by selecting its \"Table Type\".",
      )
    }

    user.joinTable(this.id, {
      roomId: this.room.id,
      tableNumber: this.tableNumber,
      seatNumber,
    })
  }

  /**
   * Removes a user from the table
   *
   * @param user - The user leaving the table
   */
  public leave(user: User): void {
    if (!this.users.some((u: User) => u.user?.id === user.user?.id)) {
      return
    }

    if (typeof user.getSeatNumber(this.id) !== "undefined") {
      this.standUser(user)
    }

    this.users = this.users.filter((u: User) => u.user?.id !== user.user?.id)

    // Announce when user leaves table
    this.chat.addMessage({
      user,
      type: TableChatMessageType.USER_LEFT,
      messageVariables: { username: user.user?.username },
    })
    user.io.to(this.id).emit(SocketEvents.TABLE_CHAT_UPDATED)
    logger.debug(`${user.user?.username} has left table #${this.tableNumber}.`)

    user.io.to(this.room.id).emit(SocketEvents.ROOM_DATA_UPDATED)
    user.socket.to(this.id).emit(SocketEvents.TABLE_DATA_UPDATED)

    // Set new table host
    if (this.host === user && this.users.length > 0) {
      this.host = this.users[0]

      // Announce privately their role to the new table host
      this.chat.addMessage({ user, type: TableChatMessageType.TABLE_HOST, visibleToUserId: this.host.user.id })
      user.io.to(this.id).emit(SocketEvents.TABLE_CHAT_UPDATED)
    }

    // If no users are left, delete the table
    if (this.users.length === 0 && this.onRemoveSelf) {
      this.onRemoveSelf()
    }

    user.socket.leave(this.id)
    user.leaveTable(this.id)

    this.host?.tableInvitationManager.removeSentInvitationByTableId(this.id)
    user.tableInvitationManager.removeReceivedInvitationByTableId(this.id)
  }

  /**
   * Updates the table settings (`tableType` or `isRated`) and emits updated data to all connected clients
   * in the corresponding room and table channels, if any change occurred.
   *
   * @param options - An object containing optional updates:
   *   - `tableType`: The new type of the table (e.g., public, private).
   *   - `isRated`: Whether the table should be rated or not.
   *
   * @returns `true` if any setting was changed (either `tableType` or `isRated`), otherwise `false`.
   */
  public updateSettings(options: { tableType?: TableType; isRated?: boolean }): boolean {
    let isChanged: boolean = false

    if (typeof options.tableType !== "undefined" && this.tableType !== options.tableType) {
      if (this.tableType === TableType.PUBLIC && [TableType.PROTECTED, TableType.PRIVATE].includes(options.tableType)) {
        this.setSeatedUsersAsInvited()
      }

      this.tableType = options.tableType
      isChanged = true
    }

    if (typeof options.isRated !== "undefined" && this.isRated !== options.isRated) {
      this.isRated = options.isRated
      isChanged = true
    }

    return isChanged
  }

  /**
   * Automatically authorize seated users to play when the table type changes
   * from public to protected/private.
   */
  private setSeatedUsersAsInvited(): void {
    for (const user of this.users) {
      if (
        this.host &&
        user.user.id != this.host.user.id &&
        !user.tableInvitationManager.getReceivedInvitationByTableId(this.id)
      ) {
        const invitation: TableInvitation = new TableInvitation(this.room.id, this, this.host, user)
        this.host.tableInvitationManager.addSentInvitation(invitation)
        user.tableInvitationManager.addReceivedInvitation(invitation)
      }
    }
  }

  /**
   * Invites a user to join this table.
   *
   * @param inviterUserId - The user sending the invitation (must be the host).
   * @param inviteeUserId - The user being invited.
   */
  public inviteUser(inviterUserId: string, inviteeUserId: string): void {
    const fromUser: User | undefined = this.users.find((user: User) => user.user.id === inviterUserId)

    if (!fromUser) {
      throw new Error("Inviting user not found at this table.")
    }

    const toUser: User | undefined = this.room.users.find((user: User) => user.user.id === inviteeUserId)

    if (!toUser) {
      throw new Error("Invited user not found in this room.")
    }

    if (!this.host || this.host.user.id !== fromUser.user.id) {
      throw new Error("Only the table host can invite users.")
    }

    const foundExistingInvite: TableInvitation | undefined =
      toUser.tableInvitationManager.getReceivedInvitationByTableId(this.id)

    if (foundExistingInvite) {
      throw new Error(`${toUser.user.username} has already been invited to this table.`)
    }

    const invitation: TableInvitation = new TableInvitation(this.room.id, this, fromUser, toUser)
    fromUser.tableInvitationManager.addSentInvitation(invitation)
    toUser.tableInvitationManager.addReceivedInvitation(invitation)

    if ((this.tableType === TableType.PROTECTED || this.tableType === TableType.PRIVATE) && toUser.isInTable(this.id)) {
      // If user to be invited is already in the table, do not show the invitaiton modal to them - granted access to seats directly
      toUser.tableInvitationManager.acceptTableInvitation(this.id)
      logger.debug(
        `${fromUser.user.username} granted ${toUser.user.username} access to play at table #${this.tableNumber}.`,
      )
    } else {
      toUser.socket.emit(SocketEvents.TABLE_INVITATION_NOTIFICATION, invitation.toPlainObject())
      logger.debug(`${fromUser.user.username} invited ${toUser.user.username} to table #${this.tableNumber}.`)
    }
  }

  /**
   * Boots a user from the table.
   *
   * @param hostId - The ID of user attempting to boot someone (must be the table host).
   * @param userToBootId - The ID of user to be booted from the table.
   * @throws Will throw if the host is invalid or the target user is not in the table.
   */
  public bootUser(hostId: string, userToBootId: string): void {
    const host: User | undefined = this.users.find((user: User) => user.user.id === hostId)

    if (!host) {
      throw new Error("Inviting user not found at this table.")
    }

    if (this.host?.user.id !== host.user.id) {
      throw new Error("Only the table host can boot a user.")
    }

    const userToBoot: User | undefined = this.room.users.find((user: User) => user.user.id === userToBootId)

    if (!userToBoot) {
      throw new Error("Invited user not found in this room.")
    }

    const isUserInTable: boolean = this.users.some((user: User) => user.user.id === userToBoot.user.id)

    if (!isUserInTable) {
      throw new Error("User is not in the table.")
    }

    this.chat.addMessage({
      user: host,
      type: TableChatMessageType.USER_BOOTED,
      messageVariables: {
        tableHostUsername: host.user.username,
        username: userToBoot.user.username,
      },
    })

    // Notify the user privately
    userToBoot.socket.emit(SocketEvents.TABLE_BOOTED_USER_NOTIFICATION, {
      id: createId(),
      roomId: this.room.id,
      tableId: this.id,
      tableNumber: this.tableNumber,
      hostUsername: host.user.username,
    })

    logger.debug(`${userToBoot.user.username} has been booted from table #${this.tableNumber}.`)

    this.leave(userToBoot)

    host.tableInvitationManager.removeSentInvitationByTableId(this.id)
    userToBoot.tableInvitationManager.removeReceivedInvitationByTableId(this.id)
  }

  /**
   * Assigns a user to a specific seat number, with validation.
   * @param user The user to seat.
   * @param seats The full list of seats for this table.
   * @param seatNumber The seat number the user wants to occupy.
   */
  public sitUser(user: User, seatNumber: number): void {
    if (this.tableType === TableType.PROTECTED || this.tableType === TableType.PRIVATE) {
      const isInvited: boolean =
        user.user.id === this.host?.user.id || !!user.tableInvitationManager.getReceivedInvitationByTableId(this.id)

      if (!isInvited) {
        throw new Error("Only invited users may sit at this table.")
      }
    }

    // Stand first if already seated
    if (this.tableSeatManager.hasSeat(user)) {
      this.standUser(user)
    }

    this.tableSeatManager.assignSeat(user, this.seats, seatNumber)
    user.updateJoinedTable(this.id, { seatNumber })
    logger.debug(`${user.user?.username} is seated at seat #${seatNumber}.`)
  }

  /**
   * Removes a user from their seat and clears related game data.
   *
   * This resets the seat and updates the user's table and seat references.
   *
   * @param user - The user to stand up from the table.
   */
  public standUser(user: User): void {
    const previousSeatNumber: number | undefined = user.getSeatNumber(this.id)

    this.tableSeatManager.unassignSeat(user)
    user.updateJoinedTable(this.id, {
      seatNumber: undefined,
      isReady: false,
      isPlaying: false,
    })
    logger.debug(`${user.user?.username} stood up from seat #${previousSeatNumber}.`)

    if (this.game.state === TowersGameState.COUNTDOWN || this.game.state === TowersGameState.WAITING) {
      this.game.handleUserDepartureMidGame(user)
    }
  }

  /**
   * Sets the ready state for a user currently seated at the table.
   *
   * @param user - The user whose ready state is being updated.
   * @param isReady - A boolean indicating whether the user is ready.
   */
  public setUserReady(user: User, isReady: boolean): void {
    const seat: TableSeat | undefined = this.tableSeatManager.getTableSeat(user)

    if (typeof seat === "undefined") {
      throw new Error("The user is not seated.")
    }

    user.updateJoinedTable(this.id, { isReady })
    logger.debug(`${user.user?.username} is ${isReady ? "ready" : "not ready"}.`)

    if (this.game.checkIfHasMinimumTeams()) {
      setTimeout(() => this.game?.startCountdown(), 2000)
    } else {
      logger.debug("Not enough ready users or teams to play.")
    }
  }

  /**
   * Groups table seats into structured teams based on seat number.
   *
   * Each team is formed by grouping every 2 seats together (i.e., seatNumber 1 & 2 = team 1, 3 & 4 = team 2, etc.).
   * It assigns a `targetNumber` to each seat, which matches the original `seatNumber`.
   *
   * The team order is rearranged according to a custom visual layout preference defined by `teamOrder` (i.e., [1, 3, 2, 4]).
   * This is used to render teams consistently on the client UI.
   *
   * @returns - An ordered array of structured team objects with their respective seats.
   *
   * @example
   * // If this.seats = [{seatNumber: 1}, {seatNumber: 2}, {seatNumber: 3}, {seatNumber: 4}]
   * // This will group them into:
   * // - Team 1: seat 1 & 2
   * // - Team 2: seat 3 & 4
   * // Then reorder them into teamOrder: [1, 3, 2, 4]
   */
  public getStructuredTeams(): ServerTowersTeam[] {
    const teamMap: Map<number, ServerTowersSeat[]> = new Map<number, ServerTowersSeat[]>()

    for (const seat of this.seats) {
      if (!teamMap.has(seat.teamNumber)) {
        teamMap.set(seat.teamNumber, [])
      }

      const seatPlain: TableSeatPlainObject = seat.toPlainObject()
      teamMap.get(seat.teamNumber)!.push({
        ...seatPlain,
        targetNumber: seat.seatNumber,
      })
    }

    const teamOrder: number[] = [1, 3, 2, 4]
    return teamOrder.map((teamNumber: number) => ({
      teamNumber,
      seats: teamMap.get(teamNumber) ?? [],
    }))
  }

  /**
   * Registers a callback to be invoked when the table is empty and should be removed.
   * The callback is stored and later called when the last user leaves the table.
   *
   * @param callback - A function to execute when the table becomes empty.
   */
  public remove(callback: () => void): void {
    if (this.users.length === 0) {
      this.onRemoveSelf = callback
    }
  }

  public toPlainObject(user: User): TablePlainObject {
    const currentUser: User | undefined = this.users.find((u: User) => u.user.id === user.user.id)
    return {
      id: this.id,
      tableNumber: this.tableNumber,
      host: this.host?.toPlainObject(),
      tableType: this.tableType,
      isRated: this.isRated,
      seats: this.getStructuredTeams(),
      users: this.users.map((user: User) => user.toPlainObject()),
      usersToInvite: this.usersToInvite.map((user: User) => user.toPlainObject()),
      usersToBoot: this.usersToBoot.map((user: User) => user.toPlainObject()),
      chat: currentUser ? this.chat.toPlainObject(currentUser) : undefined,
      game: this.game.toPlainObject(),
    }
  }
}
