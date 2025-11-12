import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import { TowersPlayerLite } from "db";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { getTowersPlayerLiteIncludes } from "@/prisma/selects";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const { userId } = await request.json();

  try {
    const player: TowersPlayerLite = await prisma.towersPlayer.create({
      data: {
        user: { connect: { id: userId } },
        controlKeys: { create: {} },
        stats: { create: {} },
      },
      include: getTowersPlayerLiteIncludes(),
    });

    return NextResponse.json({
      success: true,
      message: t({ message: "The player has been created." }),
      data: player,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
