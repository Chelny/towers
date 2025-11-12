import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  Prisma,
  TableInvitationStatus,
  TableType,
  TowersTableInvitation,
  TowersTableSeatWithRelations,
  TowersTableWithRelations,
} from "db";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError, HttpError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersTableIncludes, getTowersTableInvitationIncludes, getTowersTableSeatIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { Player } from "@/server/towers/models/Player";
import { serverState } from "@/server/towers/models/ServerState";
import { Table } from "@/server/towers/models/Table";
import { dynamicActivate } from "@/translations/languages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { seatNumber } = await request.json();
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const tableSeat: TowersTableSeatWithRelations = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const table: (TowersTableWithRelations & { invitations: TowersTableInvitation[] }) | null =
          await transaction.towersTable.findUnique({
            where: { id: tableId },
            include: {
              ...getTowersTableIncludes(),
              invitations: {
                where: {
                  inviteePlayerId: session.user.id,
                  status: TableInvitationStatus.ACCEPTED,
                },
                include: getTowersTableInvitationIncludes(),
              },
            },
          });

        if (!table) {
          throw new HttpError(404, "Table not found");
        }

        // Must be invited to sit if table is protected/private
        if (table.tableType === TableType.PROTECTED || table.tableType === TableType.PRIVATE) {
          const isTableHost: boolean = table.hostPlayerId === session.user.id;
          const isInvited: boolean = table.invitations.length > 0;

          if (!isTableHost && !isInvited) {
            throw new HttpError(403, "You are not invited to this table");
          }
        }

        // Stand first if already seated
        const existingSeat: TowersTableSeatWithRelations | null = await transaction.towersTableSeat.findFirst({
          where: { occupiedByPlayerId: session.user.id },
          include: getTowersTableSeatIncludes(),
        });

        if (existingSeat && existingSeat.tableId !== tableId) {
          throw new HttpError(
            409,
            `You're already seated at table #${existingSeat.table.tableNumber}. Please stand up first.`,
          );
        }

        // Find requested seat and check if empty
        const seat: { occupiedByPlayerId: string | null } | null = await transaction.towersTableSeat.findUnique({
          where: { tableId_seatNumber: { tableId, seatNumber } },
          select: { occupiedByPlayerId: true },
        });

        if (!seat) {
          throw new HttpError(404, "Seat not found");
        }

        if (seat.occupiedByPlayerId) {
          throw new HttpError(409, "Seat already occupied");
        }

        // Sit user
        return transaction.towersTableSeat.update({
          where: { tableId_seatNumber: { tableId, seatNumber } },
          data: { occupiedByPlayerId: session.user.id },
          include: getTowersTableSeatIncludes(),
        });
      },
    );

    if (tableSeat.occupiedByPlayerId && tableSeat.occupiedByPlayer) {
      const player: Player = serverState.getOrCreatePlayer(
        tableSeat.occupiedByPlayerId,
        tableSeat.occupiedByPlayer?.user.username,
      );
      const table: Table = serverState.getOrCreateTable(tableId);

      table.occupySeat(seatNumber, player);
    }

    await publishRedisEvent(RedisEvents.TABLE_SEAT_SIT, { tableSeat });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
