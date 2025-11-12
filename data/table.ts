import { TowersTableSeatWithRelations, TowersTableWithRelations } from "db";
import prisma from "@/lib/prisma";
import { getTowersTableIncludes } from "@/prisma/selects";
import { BoardPlainObject } from "@/server/towers/game/Board";
import { NextPiecesPlainObject } from "@/server/towers/game/NextPieces";
import { PiecePlainObject } from "@/server/towers/game/Piece";
import { PowerBarPlainObject } from "@/server/towers/game/PowerBar";

export interface ServerTowersTeam {
  teamNumber: number
  seats: ServerTowersSeat[]
}

export interface ServerTowersSeat extends TowersTableSeatWithRelations {
  targetNumber: number
  isReversed: boolean

  // In-memory state
  nextPieces: NextPiecesPlainObject | null
  powerBar: PowerBarPlainObject | null
  board: BoardPlainObject | null
  currentPiece: PiecePlainObject | null
}

export const seatsGroupByTeam = (seats: TowersTableSeatWithRelations[]): ServerTowersTeam[] => {
  const teamMap: Map<number, ServerTowersSeat[]> = new Map<number, ServerTowersSeat[]>();

  for (const seat of seats) {
    if (!teamMap.has(seat.teamNumber)) {
      teamMap.set(seat.teamNumber, []);
    }

    teamMap.get(seat.teamNumber)!.push({
      ...seat,
      targetNumber: seat.seatNumber,
      isReversed: seat.seatNumber % 2 === 0,
      nextPieces: null,
      powerBar: null,
      board: null,
      currentPiece: null,
    });
  }

  return Array.from(teamMap.entries())
    .sort(([a]: [number, ServerTowersSeat[]], [b]: [number, ServerTowersSeat[]]) => a - b) // sort by teamNumber ascending
    .map(
      ([teamNumber, seats]: [number, ServerTowersSeat[]]): ServerTowersTeam => ({
        teamNumber,
        seats: seats.sort((a: ServerTowersSeat, b: ServerTowersSeat) => a.seatNumber - b.seatNumber),
      }),
    );
};

export const hostTable = async (userId: string, tableId: string): Promise<TowersTableWithRelations> => {
  const table: TowersTableWithRelations | null = await prisma.towersTable.findUnique({
    where: { id: tableId },
    include: getTowersTableIncludes(),
  });

  if (!table) throw new Error("Table not found.");

  if (table.hostPlayer.id !== userId) {
    throw new Error("Only the table host can perform this action.");
  }

  return table;
};
