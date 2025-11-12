import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import { TowersPlayerControlKeys } from "db";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const {
    moveLeft,
    moveRight,
    cycleBlock,
    dropPiece,
    useItem,
    useItemOnPlayer1,
    useItemOnPlayer2,
    useItemOnPlayer3,
    useItemOnPlayer4,
    useItemOnPlayer5,
    useItemOnPlayer6,
    useItemOnPlayer7,
    useItemOnPlayer8,
  } = await request.json();
  const { playerId } = await params;

  try {
    const controlKeys: TowersPlayerControlKeys = await prisma.towersPlayerControlKeys.update({
      where: { playerId },
      data: {
        moveLeft,
        moveRight,
        cycleBlock,
        dropPiece,
        useItem,
        useItemOnPlayer1,
        useItemOnPlayer2,
        useItemOnPlayer3,
        useItemOnPlayer4,
        useItemOnPlayer5,
        useItemOnPlayer6,
        useItemOnPlayer7,
        useItemOnPlayer8,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: t({ message: "The control keys has been updated." }),
        data: controlKeys,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
