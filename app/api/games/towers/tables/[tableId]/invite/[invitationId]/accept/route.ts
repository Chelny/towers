import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, TableInvitationStatus, TowersTableInvitationWithRelations } from "db";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { handleAcceptTableInvitation, PostCommitActions } from "@/lib/server/handleAcceptTableInvitation";
import { getTowersTableInvitationIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { invitationId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const { invitation, postCommitActions } = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const invitation: TowersTableInvitationWithRelations = await transaction.towersTableInvitation.update({
          where: { id: invitationId },
          data: { status: TableInvitationStatus.ACCEPTED },
          include: getTowersTableInvitationIncludes(),
        });

        const postCommitActions: PostCommitActions[] = await handleAcceptTableInvitation({ transaction, invitation });

        return { invitation, postCommitActions };
      },
    );

    for (const { channel, payload, log } of postCommitActions) {
      await publishRedisEvent(channel, payload);

      if (log) {
        logger.debug(log);
      }
    }

    return NextResponse.json({ success: true, data: invitation }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
