import { NextRequest, NextResponse } from "next/server";
import { TowersPlayerStats } from "db";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ playerId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { playerId } = await params;

  try {
    const stats: TowersPlayerStats = await prisma.towersPlayerStats.findUniqueOrThrow({ where: { playerId } });

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
