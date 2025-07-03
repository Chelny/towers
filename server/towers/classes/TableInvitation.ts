import { createId } from "@paralleldrive/cuid2"
import type { Table } from "@/server/towers/classes/Table"
import type { User } from "@/server/towers/classes/User"
import { SocketEvents } from "@/constants/socket-events"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TableType } from "@/enums/table-type"
import { logger } from "@/lib/logger"

export enum TableInvitationStatus {
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Declined = "DECLINED",
}

export interface TableInvitationPlainObject {
  id: string
  roomId: string
  tableId: string
  tableNumber: number
  tableIsRated: boolean
  inviterUserId: string
  inviterUsername?: string
  inviterRating: number
  inviteeUserId: string
}

export interface DeclinedTableInvitationPlainObject {
  id: string
  roomId: string
  inviteeUsername: string
  declinedReason?: string
}

/**
 * Represents an invitation to join a table.
 */
export class TableInvitation {
  public readonly id: string = createId()
  public roomId: string
  public table: Table
  public readonly inviter: User
  public readonly invitee: User
  public status: TableInvitationStatus = TableInvitationStatus.Pending
  public declinedReason?: string

  constructor(roomId: string, table: Table, inviter: User, invitee: User) {
    this.roomId = roomId
    this.table = table
    this.inviter = inviter
    this.invitee = invitee
  }

  /**
   * Handles a user accepting an invitation to a table.
   *
   * Adds a chat message, notifies the inviter privately, joins the table, and removes the invitation.
   */
  public accept(): void {
    this.status = TableInvitationStatus.Accepted

    if (
      (this.table.tableType === TableType.PROTECTED || this.table.tableType === TableType.PRIVATE) &&
      this.invitee.isInTable(this.table.id)
    ) {
      // If user to be invited is already in the table
      this.table.chat.addMessage({
        user: this.inviter,
        type: TableChatMessageType.USER_GRANTED_SEAT_ACCESS_INVITER,
        messageVariables: { username: this.invitee.user.username },
        visibleToUserId: this.inviter.user.id,
      })

      this.table.chat.addMessage({
        user: this.invitee,
        type: TableChatMessageType.USER_GRANTED_SEAT_ACCESS_INVITEE,
        visibleToUserId: this.invitee.user.id,
      })

      logger.debug(`${this.invitee.user.username} has been granted access to play to table #${this.table.tableNumber}.`)
    } else {
      // Notify the inviter privately
      this.table.chat.addMessage({
        user: this.inviter,
        type: TableChatMessageType.USER_INVITED,
        messageVariables: { username: this.invitee.user.username },
        visibleToUserId: this.inviter.user.id,
      })

      logger.debug(`${this.invitee.user.username} accepted invitation to table #${this.table.tableNumber}.`)
    }
  }

  /**
   * Handles a user declining an invitation to this table.
   *
   * Notifies the inviter privately and removes the invitation.
   *
   * @param reason - Optional reason for declining.
   */
  public decline(reason?: string): void {
    this.status = TableInvitationStatus.Declined
    this.declinedReason = reason

    this.inviter.socket.emit(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, {
      id: this.id,
      roomId: this.roomId,
      inviteeUsername: this.invitee.user.username,
      reason,
    })

    logger.debug(
      `${this.invitee.user.username} declined invitation to table #${this.table.tableNumber}. Reason: ${reason}`,
    )
  }

  public toPlainObject(): TableInvitationPlainObject {
    return {
      id: this.id,
      roomId: this.roomId,
      tableId: this.table.id,
      tableNumber: this.table.tableNumber,
      tableIsRated: this.table.isRated,
      inviterUserId: this.inviter.user.id,
      inviterUsername: this.inviter.user.username,
      inviterRating: this.inviter.stats.rating,
      inviteeUserId: this.invitee.user.id,
    }
  }
}
