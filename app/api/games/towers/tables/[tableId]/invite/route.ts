import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import {
  PlayerWithRelations,
  Prisma,
  TableInvitationStatus,
  TableType,
  TowersRoomPlayer,
  TowersRoomPlayerWithRelations,
  TowersTable,
  TowersTableInvitation,
  TowersTableInvitationWithRelations,
  TowersTablePlayerWithRelations,
  TowersTableWithRelations,
  UserMinimal,
} from "db";
import { hostTable } from "@/data/table";
import { handleApiError, handleUnauthorizedApiError, HttpError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { handleAcceptTableInvitation, PostCommitActions } from "@/lib/server/handleAcceptTableInvitation";
import { getTowersTableInvitationIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  try {
    const table: TowersTableWithRelations | null = await hostTable(session.user.id, tableId);
    const tablePlayerIds: Set<string> = new Set(
      table.players.map((tablePlayer: TowersTablePlayerWithRelations) => tablePlayer.playerId),
    );

    // Build list of players eligible for invitation
    const playersToInvite: PlayerWithRelations[] = table.room.players
      // Exclude the table host
      .filter((roomPlayer: TowersRoomPlayerWithRelations) => roomPlayer.playerId !== table.hostPlayerId)
      .filter((roomPlayer: TowersRoomPlayerWithRelations) => {
        if (table.tableType === TableType.PUBLIC) {
          // Must not already be at the table
          return !tablePlayerIds.has(roomPlayer.playerId);
        } else {
          const isAlreadyInTable: boolean = tablePlayerIds.has(roomPlayer.playerId);

          // Must not have an accepted invite to the same table
          const hasAcceptedInvite: boolean = table.invitations.some(
            (invitation: TowersTableInvitationWithRelations) =>
              invitation.tableId === table.id &&
              invitation.inviterPlayerId === table.hostPlayerId &&
              invitation.inviteePlayerId === roomPlayer.playerId &&
              invitation.status === TableInvitationStatus.ACCEPTED,
          );

          return !(isAlreadyInTable && hasAcceptedInvite);
        }
      });

    return NextResponse.json({ success: true, data: playersToInvite }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { roomId, inviteePlayerId } = await request.json();
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    await hostTable(session.user.id, tableId);

    // Ensure invitee exists in the room
    const inviteeRoomPlayer: TowersRoomPlayer & { player: { user: UserMinimal } } =
      await prisma.towersRoomPlayer.findUniqueOrThrow({
        where: { roomId_playerId: { roomId, playerId: inviteePlayerId } },
        include: { player: { include: { user: true } } },
      });

    // Check host permissions
    const table: TowersTable = await prisma.towersTable.findUniqueOrThrow({ where: { id: tableId } });
    if (table.hostPlayerId !== session.user.id) {
      throw new HttpError(403, "Only the table host can invite users.");
    }

    // Check if already invited
    const existingInvitation: TowersTableInvitation | null = await prisma.towersTableInvitation.findFirst({
      where: { tableId, inviteePlayerId },
    });

    if (existingInvitation) {
      const inviteePlayer: string = inviteeRoomPlayer.player.user?.username;
      throw new HttpError(409, t({ message: `${inviteePlayer} has already been invited to this table.` }));
    }

    const { invitation, postCommitActions } = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        // Create invitation
        const invitation: TowersTableInvitationWithRelations = await transaction.towersTableInvitation.create({
          data: {
            roomId,
            tableId,
            inviterPlayerId: session.user.id,
            inviteePlayerId,
          },
          include: getTowersTableInvitationIncludes(),
        });

        const postCommitActions: PostCommitActions[] = await handleAcceptTableInvitation({ transaction, invitation });

        await transaction.towersPlayer.update({
          where: { id: session.user.id },
          data: { lastActiveAt: new Date() },
        });

        return { invitation, postCommitActions };
      },
    );

    for (const { channel, payload, log } of postCommitActions) {
      await publishRedisEvent(channel, payload);

      if (log) {
        logger.debug(log);
      }
    }

    const invitee: string = invitation.inviteePlayer.user.username;

    return NextResponse.json(
      {
        success: true,
        message: t({ message: `The invitation has been sent to ${invitee}.` }),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
