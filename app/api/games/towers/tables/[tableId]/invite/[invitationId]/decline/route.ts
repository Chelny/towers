import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  NotificationType,
  Prisma,
  TableInvitationStatus,
  TowersNotificationWithRelations,
  TowersTableInvitationWithRelations,
} from "db";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersNotificationIncludes, getTowersTableInvitationIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { invitationId } = await params;

  let reason: string | undefined = undefined;
  let isDeclineAll: boolean = false;

  try {
    const body = await request.json();
    reason = body.reason;
    isDeclineAll = body.isDeclineAll;
  } catch {
    // No body sent → defaults stay
  }

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const { invitation, notification } = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      let invitationsToDecline: TowersTableInvitationWithRelations[] = [];

      const invitation: TowersTableInvitationWithRelations = await transaction.towersTableInvitation.update({
        where: { id: invitationId },
        data: { status: TableInvitationStatus.DECLINED, declinedReason: reason },
        include: getTowersTableInvitationIncludes(),
      });

      invitationsToDecline.push(invitation);

      if (isDeclineAll) {
        const pendingInvitations: TowersTableInvitationWithRelations[] =
          await transaction.towersTableInvitation.findMany({
            where: { inviteePlayerId: session.user.id, status: TableInvitationStatus.PENDING },
            include: getTowersTableInvitationIncludes(),
          });

        for (const pendingInvitation of pendingInvitations) {
          const invitation: TowersTableInvitationWithRelations = await transaction.towersTableInvitation.update({
            where: { id: pendingInvitation.id },
            data: { status: TableInvitationStatus.DECLINED },
            include: getTowersTableInvitationIncludes(),
          });

          invitationsToDecline.push(invitation);
        }
      }

      let notification: TowersNotificationWithRelations | null = null;

      for (const invitation of invitationsToDecline) {
        notification = await transaction.towersNotification.create({
          data: {
            playerId: invitation.inviteePlayerId,
            roomId: invitation.roomId,
            type: NotificationType.TABLE_INVITE_DECLINED,
            tableInvitationId: invitation.id,
          },
          include: getTowersNotificationIncludes(),
        });
      }

      return { invitation, notification };
    });

    if (invitation && notification) {
      await publishRedisEvent(RedisEvents.TABLE_INVITATION_DECLINE, {
        userId: invitation.inviterPlayer.id,
        notification,
      });
      logger.debug(
        `${invitation.inviteePlayer.user.username} declined invitation to table #${invitation.table.tableNumber}. Reason: ${invitation.declinedReason}`,
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
