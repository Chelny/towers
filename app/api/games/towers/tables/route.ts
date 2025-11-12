import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import { Prisma, TowersTable } from "db";
import { NUM_TABLE_SEATS } from "@/constants/game";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { serverState } from "@/server/towers/models/ServerState";
import { dynamicActivate } from "@/translations/languages";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const { roomId, tableType, isRated } = await request.json();

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const { table } = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const existingTables: { tableNumber: number }[] = await transaction.towersTable.findMany({
        where: { roomId },
        select: { tableNumber: true },
      });

      const takenTableNumbers: number[] = existingTables.map((table: { tableNumber: number }) => table.tableNumber);

      let availableTableNumber: number = 1;
      for (let i = 1; i <= takenTableNumbers.length + 1; i++) {
        if (!takenTableNumbers.includes(i)) {
          availableTableNumber = i;
          break;
        }
      }

      const table: TowersTable = await transaction.towersTable.create({
        data: {
          roomId,
          tableNumber: availableTableNumber,
          hostPlayerId: session.user.id,
          tableType,
          isRated,
        },
      });

      // Create the 8 seats for new table
      const seatsData: Prisma.TowersTableSeatCreateManyInput[] = Array.from(
        { length: NUM_TABLE_SEATS },
        (_, index: number) => ({
          tableId: table.id,
          seatNumber: index + 1,
          teamNumber: Math.ceil((index + 1) / 2),
        }),
      );

      await transaction.towersTableSeat.createMany({ data: seatsData });

      return { table };
    });

    await serverState.reloadTable(table.id);

    const tableNumber: number = table.tableNumber;

    return NextResponse.json(
      {
        success: true,
        message: t({ message: `The table #${tableNumber} has been created.` }),
        data: table.id,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
