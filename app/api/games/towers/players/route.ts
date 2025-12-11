import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { getTowersPlayerLiteIncludes, TowersPlayerLite } from "@/types/prisma";

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

    // TODO: Convert to plain object (?)
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return handleApiError(error);
  }
}
