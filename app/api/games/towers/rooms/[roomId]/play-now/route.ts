import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { GameState, Prisma, TableType, TowersTableSeat, TowersTableWithRelations } from "db";
import { seatsGroupByTeam, ServerTowersSeat, ServerTowersTeam } from "@/data/table";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { getTowersTableIncludes } from "@/prisma/selects";
import { Player } from "@/server/towers/models/Player";
import { serverState } from "@/server/towers/models/ServerState";
import { Table } from "@/server/towers/models/Table";
import { dynamicActivate } from "@/translations/languages";

/**
 * Auto-seats a user in a random public table within the room.
 *
 * - Prioritizes tables that are public, not playing, and have fewer players.
 * - If no eligible table exists, creates a new one.
 * - Chooses an empty seat, preferring fully empty teams.
 * - Within candidates, seats are chosen in priority order [1,3,5,7,2,4,6,8].
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { roomId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const { tableToJoin, selectedSeat } = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const publicTables: TowersTableWithRelations[] = await transaction.towersTable.findMany({
        where: {
          roomId,
          tableType: TableType.PUBLIC,
          game: { state: { not: GameState.PLAYING } },
          NOT: { players: { some: { playerId: session.user.id } } }, // Exclude tables where the player is already in
        },
        include: getTowersTableIncludes(),
      });

      // Sort tables by lowest number of seated users (prefer emptier tables)
      const sortedTables: TowersTableWithRelations[] = publicTables.sort(
        (a: TowersTableWithRelations, b: TowersTableWithRelations) => {
          const aOccupied: number = a.seats.filter((seat: TowersTableSeat) => seat.occupiedByPlayerId !== null).length;
          const bOccupied: number = b.seats.filter((seat: TowersTableSeat) => seat.occupiedByPlayerId !== null).length;
          return aOccupied - bOccupied;
        },
      );

      let tableToJoin: TowersTableWithRelations = sortedTables[0];

      // If no tables available, create one
      if (!tableToJoin) {
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

        tableToJoin = await transaction.towersTable.create({
          data: {
            roomId,
            tableNumber: availableTableNumber,
            hostPlayerId: session.user.id,
            tableType: TableType.PUBLIC,
            isRated: true,
          },
          include: getTowersTableIncludes(),
        });

        // Create the 8 seats for new table
        const seatsData: Prisma.TowersTableSeatCreateManyInput[] = Array.from({ length: 8 }, (_, index: number) => ({
          tableId: tableToJoin.id,
          seatNumber: index + 1,
          teamNumber: Math.ceil((index + 1) / 2),
        }));

        await transaction.towersTableSeat.createMany({ data: seatsData });

        // Update table with seats
        tableToJoin = await transaction.towersTable.findUniqueOrThrow({
          where: { id: tableToJoin.id },
          include: getTowersTableIncludes(),
        });
      }

      const teams: ServerTowersTeam[] = seatsGroupByTeam(tableToJoin.seats);

      // 1. Find teams with no users seated (team is fully empty)
      const emptyTeamSeats: ServerTowersSeat[] = teams
        .filter((team: ServerTowersTeam) => team.seats.every((seat: ServerTowersSeat) => !seat.occupiedByPlayerId))
        .flatMap((team: ServerTowersTeam) => team.seats);

      // 2. Fallback: find all other empty seats
      const emptySeats: ServerTowersSeat[] = teams
        .flatMap((team: ServerTowersTeam) => team.seats)
        .filter((seat: ServerTowersSeat) => !seat.occupiedByPlayerId);

      const preferredSeats: ServerTowersSeat[] = emptyTeamSeats.length > 0 ? emptyTeamSeats : emptySeats;

      if (preferredSeats.length === 0) {
        throw new Error(`No empty seats available at table #${tableToJoin.tableNumber}`);
      }

      const preferredSeatOrder: number[] = [1, 3, 5, 7, 2, 4, 6, 8];

      // Filter seats by priority order
      const orderedPreferredSeats: ServerTowersSeat[] = preferredSeatOrder
        .map((seatNumber: number) => preferredSeats.find((seat: ServerTowersSeat) => seat.seatNumber === seatNumber))
        .filter((seat: ServerTowersSeat | undefined): seat is ServerTowersSeat => !!seat);

      if (orderedPreferredSeats.length === 0) {
        throw new Error(`No empty seats available at table #${tableToJoin.tableNumber}.`);
      }

      // Pick the first available seat from the priority list
      const selectedSeat: ServerTowersSeat = orderedPreferredSeats[0];

      await transaction.towersTableSeat.update({
        where: {
          tableId_seatNumber: {
            tableId: selectedSeat.tableId,
            seatNumber: selectedSeat.seatNumber,
          },
        },
        data: { occupiedByPlayerId: session.user.id },
      });

      return { tableToJoin, selectedSeat };
    });

    const table: Table = serverState.getOrCreateTable(tableToJoin.id);
    const player: Player = serverState.getOrCreatePlayer(session.user.id, session.user.username);
    table.occupySeat(selectedSeat.seatNumber, player);

    return NextResponse.json({ success: true, data: tableToJoin.id }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
