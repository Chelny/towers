import {
  Prisma,
  TableChatMessageType,
  TableType,
  TowersTableChatMessageWithRelations,
  TowersTableInvitationWithRelations,
  TowersTablePlayer,
  TowersTableWithRelations,
} from "db";
import { RedisEvents } from "@/constants/socket-events";
import { getTowersTableChatMessageIncludes, getTowersTableIncludes } from "@/prisma/selects";

export type PostCommitActions = {
  channel: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  log?: string
}

/**
 * Handles a user accepting an invitation to a table.
 *
 * Adds a chat message, notifies the inviter privately, joins the table, and removes the invitation.
 */
export async function handleAcceptTableInvitation({
  transaction,
  invitation,
}: {
  transaction: Prisma.TransactionClient
  invitation: TowersTableInvitationWithRelations
}): Promise<PostCommitActions[]> {
  const postCommitActions: PostCommitActions[] = [];

  // Check if invitee is already seated
  const inviteeInTable: TowersTablePlayer | null = await transaction.towersTablePlayer.findUnique({
    where: {
      tableId_playerId: {
        tableId: invitation.tableId,
        playerId: invitation.inviteePlayerId,
      },
    },
  });

  // Auto-accept case: Existing seated players in protected/private tables
  if (
    (invitation.table.tableType === TableType.PROTECTED || invitation.table.tableType === TableType.PRIVATE) &&
    inviteeInTable
  ) {
    const messages = [
      {
        tableId: invitation.tableId,
        playerId: invitation.inviterPlayerId,
        type: TableChatMessageType.USER_GRANTED_SEAT_ACCESS_INVITER,
        textVariables: { username: invitation.inviteePlayer.user.username },
        visibleToUserId: invitation.inviterPlayer.userId,
      },
      {
        tableId: invitation.tableId,
        playerId: invitation.inviteePlayerId,
        type: TableChatMessageType.USER_GRANTED_SEAT_ACCESS_INVITEE,
        visibleToUserId: invitation.inviteePlayer.userId,
      },
    ];

    // Emit individual messages to respective users
    for (const message of messages) {
      const chatMessage: TowersTableChatMessageWithRelations = await transaction.towersTableChatMessage.create({
        data: message,
        include: getTowersTableChatMessageIncludes(),
      });

      postCommitActions.push({
        channel: RedisEvents.TABLE_MESSAGE_SEND,
        payload: { tableId: invitation.tableId, chatMessage },
      });
    }

    const table: TowersTableWithRelations = await transaction.towersTable.findFirstOrThrow({
      where: { id: invitation.tableId },
      include: getTowersTableIncludes(),
    });

    postCommitActions.push({
      channel: RedisEvents.TABLE_INVITATION_ACCEPT,
      payload: { userId: invitation.inviteePlayer.userId, table },
      log: `${invitation.inviterPlayer.user?.username} granted ${invitation.inviteePlayer.user?.username} access to table #${invitation.table.tableNumber}.`,
    });
  } else {
    // Notify inviter privately that the invitee accepted their invitation
    const acceptedChatMessage: TowersTableChatMessageWithRelations = await transaction.towersTableChatMessage.create({
      data: {
        tableId: invitation.tableId,
        playerId: invitation.inviterPlayerId,
        type: TableChatMessageType.USER_INVITED_TO_TABLE,
        textVariables: { username: invitation.inviteePlayer.user.username },
        visibleToUserId: invitation.inviterPlayer.userId,
      },
      include: getTowersTableChatMessageIncludes(),
    });

    postCommitActions.push({
      channel: RedisEvents.TABLE_MESSAGE_SEND,
      payload: { tableId: invitation.tableId, chatMessage: acceptedChatMessage },
      log: `${invitation.inviteePlayer.user.username} accepted ${invitation.inviterPlayer.user.username}'s invitation to table #${invitation.table.tableNumber}.`,
    });
  }

  return postCommitActions;
}
