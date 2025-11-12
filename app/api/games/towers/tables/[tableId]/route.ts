import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  PlayerListWithRelations,
  Prisma,
  TableChatMessageType,
  TableInvitationStatus,
  TableType,
  TowersTable,
  TowersTableChatMessageWithRelations,
  TowersTableInvitation,
  TowersTableSeatWithRelations,
  TowersTableWithRelations,
} from "db";
import { RedisEvents } from "@/constants/socket-events";
import { hostTable } from "@/data/table";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersTableChatMessageIncludes, getTowersTableIncludes, getTowersTableSeatIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { serverState } from "@/server/towers/models/ServerState";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableType, isRated } = await request.json();
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  try {
    await hostTable(session.user.id, tableId);

    const { table, isTableTypeUpdated, chatMessage, seatedPlayer } = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const previousTable: TowersTable = await transaction.towersTable.findUniqueOrThrow({
          where: { id: tableId },
        });

        const table: TowersTableWithRelations = await transaction.towersTable.update({
          where: { id: tableId },
          data: { tableType, isRated },
          include: getTowersTableIncludes(),
        });

        let isTableTypeUpdated: boolean = false;
        let chatMessage: TowersTableChatMessageWithRelations | null = null;
        let seatedPlayer: PlayerListWithRelations | null = null;

        if (previousTable.tableType !== table.tableType) {
          chatMessage = await transaction.towersTableChatMessage.create({
            data: {
              tableId,
              playerId: table.hostPlayerId,
              type: TableChatMessageType.TABLE_TYPE,
              textVariables: { tableType: table.tableType },
              visibleToUserId: table.hostPlayer.id,
            },
            include: getTowersTableChatMessageIncludes(),
          });

          isTableTypeUpdated = true;

          // Automatically authorize seated users to play when the table type changes from PUBLIC → PROTECTED/PRIVATE
          if (
            previousTable.tableType === TableType.PUBLIC &&
            [TableType.PROTECTED, TableType.PRIVATE].includes(tableType)
          ) {
            const occupiedSeats: TowersTableSeatWithRelations[] = await transaction.towersTableSeat.findMany({
              where: {
                tableId: table.id,
                occupiedByPlayerId: { not: null },
              },
              include: getTowersTableSeatIncludes(),
            });

            for (const occupiedSeat of occupiedSeats) {
              seatedPlayer = occupiedSeat.occupiedByPlayer;
              if (!seatedPlayer) continue;

              const hasNoInvitation: boolean = !seatedPlayer.receivedTableInvitations.some(
                (invitation: TowersTableInvitation) => invitation.tableId === table.id,
              );

              if (table.hostPlayerId !== seatedPlayer.id && hasNoInvitation) {
                await transaction.towersTableInvitation.create({
                  data: {
                    roomId: table.roomId,
                    tableId: table.id,
                    inviterPlayerId: table.hostPlayerId,
                    inviteePlayerId: seatedPlayer.id,
                    status: TableInvitationStatus.ACCEPTED,
                  },
                });
              }
            }
          }
        }

        return { table, isTableTypeUpdated, chatMessage, seatedPlayer };
      },
    );

    if (table) {
      await publishRedisEvent(RedisEvents.TABLE_OPTIONS_UPDATE, { table });
    }

    if (isTableTypeUpdated && chatMessage) {
      await publishRedisEvent(RedisEvents.TABLE_MESSAGE_SEND, { tableId: table.id, chatMessage });
    }

    if (seatedPlayer && table) {
      await publishRedisEvent(RedisEvents.TABLE_INVITATION_ACCEPT, { userId: seatedPlayer.id, table });
    }

    return NextResponse.json({ success: true, data: table }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  try {
    await prisma.towersTable.delete({ where: { id: tableId } });

    // Delete in-memory table
    serverState.deleteTable(tableId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
