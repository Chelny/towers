import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  NotificationType,
  PlayerWithRelations,
  Prisma,
  TableChatMessageType,
  TowersNotificationWithRelations,
  TowersTableBootWithRelations,
  TowersTableChatMessageWithRelations,
  TowersTablePlayerWithRelations,
  TowersTableWithRelations,
} from "db";
import { RedisEvents } from "@/constants/socket-events";
import { hostTable } from "@/data/table";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import {
  getTowersNotificationIncludes,
  getTowersTableBootIncludes,
  getTowersTableChatMessageIncludes,
} from "@/prisma/selects";
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

    const playersToBoot: PlayerWithRelations[] = table.players.filter(
      (tablePlayer: TowersTablePlayerWithRelations) => tablePlayer.playerId !== table.hostPlayerId,
    ); // Exclude table host

    return NextResponse.json({ success: true, data: playersToBoot }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { playerToBootId } = await request.json();
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    await hostTable(session.user.id, tableId);

    const { tableBoot, chatMessage, notification } = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const tableBoot: TowersTableBootWithRelations = await transaction.towersTableBoot.create({
          data: {
            tableId,
            booterPlayerId: session.user.id,
            bootedPlayerId: playerToBootId,
          },
          include: getTowersTableBootIncludes(),
        });

        // Boot player from table
        await transaction.towersTablePlayer.delete({
          where: { tableId_playerId: { tableId, playerId: playerToBootId } },
        });

        const chatMessage: TowersTableChatMessageWithRelations = await transaction.towersTableChatMessage.create({
          data: {
            tableId,
            playerId: session.user.id,
            type: TableChatMessageType.USER_BOOTED_FROM_TABLE,
            textVariables: {
              tableHostUsername: tableBoot.booterPlayer.user.username,
              username: tableBoot.bootedPlayer.user.username,
            },
          },
          include: getTowersTableChatMessageIncludes(),
        });

        const notification: TowersNotificationWithRelations = await transaction.towersNotification.create({
          data: {
            player: { connect: { id: playerToBootId } },
            roomId: tableBoot.table.roomId,
            type: NotificationType.TABLE_BOOTED,
            bootedFromTable: { connect: { id: tableBoot.id } },
          },
          include: getTowersNotificationIncludes(),
        });

        // Remove booted user invitation to the table if applicable
        await transaction.towersTableInvitation.deleteMany({
          where: {
            tableId,
            inviteePlayerId: playerToBootId,
          },
        });

        return { tableBoot, chatMessage, notification };
      },
    );

    if (chatMessage) {
      await publishRedisEvent(RedisEvents.TABLE_MESSAGE_SEND, { tableId, chatMessage });
    }

    if (tableBoot && notification) {
      await publishRedisEvent(RedisEvents.TABLE_BOOT_USER, { userId: tableBoot.bootedPlayer.id, notification });
      logger.debug(
        `${tableBoot.bootedPlayer.user.username} has been booted from table #${tableBoot.table.tableNumber}.`,
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
