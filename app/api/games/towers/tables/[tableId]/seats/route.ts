import { NextRequest, NextResponse } from "next/server";
import { Prisma, TowersTableSeatWithRelations } from "db";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { getTowersTableSeatIncludes } from "@/prisma/selects";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  try {
    const tableSeats: TowersTableSeatWithRelations[] = await prisma.towersTableSeat.findMany({
      where: { tableId },
      include: getTowersTableSeatIncludes(),
    });

    return NextResponse.json({ success: true, data: tableSeats }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  try {
    const { tableSeats } = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const seatsData: Prisma.TowersTableSeatCreateManyInput[] = Array.from({ length: 8 }, (_, index: number) => ({
        tableId,
        seatNumber: index + 1,
        teamNumber: Math.ceil((index + 1) / 2),
      }));

      await transaction.towersTableSeat.createMany({ data: seatsData });

      const tableSeats: TowersTableSeatWithRelations[] = await transaction.towersTableSeat.findMany({
        where: { tableId },
        include: getTowersTableSeatIncludes(),
        orderBy: { seatNumber: "asc" },
      });

      return { tableSeats };
    });

    return NextResponse.json({ success: true, data: tableSeats }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string; seatNumber: number }> },
): Promise<NextResponse<ApiResponse>> {
  const { occupiedByPlayerId } = await request.json();
  const { tableId, seatNumber } = await params;

  try {
    const tableSeat: TowersTableSeatWithRelations = await prisma.towersTableSeat.update({
      where: {
        tableId_seatNumber: {
          tableId,
          seatNumber,
        },
      },
      data: { occupiedByPlayerId },
      include: getTowersTableSeatIncludes(),
    });

    return NextResponse.json({ success: true, data: tableSeat }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
