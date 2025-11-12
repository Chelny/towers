import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, TowersTableSeatWithRelations } from "db";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError, HttpError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersTableSeatIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { serverState } from "@/server/towers/models/ServerState";
import { Table } from "@/server/towers/models/Table";
import { dynamicActivate } from "@/translations/languages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const tableSeat: TowersTableSeatWithRelations = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const seat: TowersTableSeatWithRelations | null = await transaction.towersTableSeat.findFirst({
          where: {
            tableId,
            occupiedByPlayerId: session.user.id,
          },
          include: getTowersTableSeatIncludes(),
        });

        if (!seat) {
          throw new HttpError(409, "Player is not seated at this table.");
        }

        return transaction.towersTableSeat.update({
          where: { id: seat.id },
          data: { occupiedByPlayerId: null },
          include: getTowersTableSeatIncludes(),
        });
      },
    );

    const table: Table = serverState.getOrCreateTable(tableId);
    table.vacateSeat(tableSeat.seatNumber);

    await publishRedisEvent(RedisEvents.TABLE_SEAT_STAND, { tableSeat });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
