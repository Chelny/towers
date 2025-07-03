import {
  TableInvitation,
  TableInvitationPlainObject,
  TableInvitationStatus,
} from "@/server/towers/classes/TableInvitation"

export interface TableInvitationManagerPlainObject {
  sent: TableInvitationPlainObject[]
  received: TableInvitationPlainObject[]
}

export class TableInvitationManager {
  private readonly userId: string
  private sentInvitations: TableInvitation[] = []
  private receivedInvitations: TableInvitation[] = []

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Adds a new invitation sent by this user.
   * @param invitation The sent table invitation.
   */
  public addSentInvitation(invitation: TableInvitation): void {
    this.sentInvitations.push(invitation)
  }

  /**
   * Adds a new invitation received by this user.
   * @param invitation The received table invitation.
   */
  public addReceivedInvitation(invitation: TableInvitation): void {
    this.receivedInvitations.push(invitation)
  }

  /**
   * Returns all invitations this user has sent.
   */
  public getSentInvitations(): TableInvitation[] {
    return this.sentInvitations
  }

  /**
   * Returns all invitations this user has received.
   */
  public getReceivedInvitations(): TableInvitation[] {
    return this.receivedInvitations
  }

  /**
   * Get the sent invitation for a specific tableId, if any.
   * @param tableId - The ID of the table.
   */
  public getSentInvitationByTableId(tableId: string): TableInvitation | undefined {
    return this.sentInvitations.find((invitation: TableInvitation) => invitation.table.id === tableId)
  }

  /**
   * Get the received invitation for a specific tableId, if any.
   * @param tableId - The ID of the table.
   */
  public getReceivedInvitationByTableId(tableId: string): TableInvitation | undefined {
    return this.receivedInvitations.find((invitation: TableInvitation) => invitation.table.id === tableId)
  }

  /**
   * Returns all pending invitations this user has received.
   */
  public getPendingReceivedInvitations(): TableInvitation[] {
    return this.receivedInvitations.filter(
      (invitation: TableInvitation) => invitation.status === TableInvitationStatus.Pending,
    )
  }

  /**
   * Returns all accepted invitations this user has received.
   */
  public getAcceptedReceivedInvitations(): TableInvitation[] {
    return this.receivedInvitations.filter(
      (invitation: TableInvitation) => invitation.status === TableInvitationStatus.Accepted,
    )
  }

  /**
   * Removes a sent invitation for a specific table ID.
   *
   * @param tableId - The ID of the table whose sent invitation should be removed.
   */
  public removeSentInvitationByTableId(tableId: string): void {
    this.sentInvitations = this.sentInvitations.filter((invitation: TableInvitation) => invitation.table.id !== tableId)
  }

  /**
   * Removes a received invitation for a specific table ID.
   *
   * @param tableId - The ID of the table whose received invitation should be removed.
   */
  public removeReceivedInvitationByTableId(tableId: string): void {
    this.receivedInvitations = this.receivedInvitations.filter(
      (invitation: TableInvitation) => invitation.table.id !== tableId,
    )
  }

  /**
   * Removes all invitations (both sent and received).
   */
  public clearInvitations(): void {
    this.sentInvitations = []
    this.receivedInvitations = []
  }

  /**
   * Handles a user accepting an invitation to this table.
   *
   * Adds a chat message, notifies the inviter privately, joins the table, and removes the invitation.
   *
   * @param tableId - The ID of the table.
   */
  public acceptTableInvitation(tableId: string): void {
    const invitation: TableInvitation | undefined = this.getReceivedInvitationByTableId(tableId)
    if (!invitation) throw new Error("Invitation not found")

    invitation.accept()
  }

  /**
   * Handles a user declining an invitation to this table.
   *
   * Notifies the inviter privately and removes the invitation.
   *
   * @param tableId - The ID of the table.
   * @param reason - Optional reason for declining.
   */
  public declineTableInvitation(tableId: string, reason?: string): void {
    const invitation: TableInvitation | undefined = this.getReceivedInvitationByTableId(tableId)
    if (!invitation) throw new Error("Invitation not found")

    invitation.decline(reason)
    this.removeReceivedInvitationByTableId(invitation.table.id)
  }

  public toPlainObject(): TableInvitationManagerPlainObject {
    return {
      sent: this.sentInvitations.map((invitation: TableInvitation) => invitation.toPlainObject()),
      received: this.receivedInvitations.map((invitation: TableInvitation) => invitation.toPlainObject()),
    }
  }
}
