import { NextRequest, NextResponse } from "next/server";
import { Prisma, TowersPlayerStats } from "db";
import { HERO_CODE_ELIGIBILITY_TIME, HERO_CODE_REQUIRED_WINS } from "@/constants/game";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";

/**
 * Checks whether a player is eligible for a hero code.
 *
 * Requirements:
 * - At least 25 wins (from rated or unrated games)
 * - All within the last 2 hours
 *
 * @param winHistory
 * @returns `true` if eligible, otherwise `false`.
 */
function checkIfEligibleForHeroCode(winHistory: number[]): boolean {
  if (winHistory.length < HERO_CODE_REQUIRED_WINS) return false;

  const firstWin: number = winHistory[0];
  const now: number = Date.now();

  return now - firstWin <= HERO_CODE_ELIGIBILITY_TIME;
}

function pushWinTimestamp(existingHistory: number[]): number[] {
  const now: number = Date.now();
  const cutoff: number = now - HERO_CODE_ELIGIBILITY_TIME;

  // Filter out timestamps older than 2 hours
  let updated: number[] = existingHistory.filter((timestamp: number) => timestamp >= cutoff);

  // Add new win
  updated.push(now);

  // Keep last 25 wins
  if (updated.length > HERO_CODE_REQUIRED_WINS) {
    updated = updated.slice(-HERO_CODE_REQUIRED_WINS);
  }

  return updated;
}

export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ playerId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { playerId } = await params;

  try {
    const { stats, isEligibleForHeroCode } = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const currentStats: TowersPlayerStats = await transaction.towersPlayerStats.findUniqueOrThrow({
          where: { playerId },
        });

        const oldHistory: number[] = (currentStats.winHistory as number[]) ?? [];
        const newHistory: number[] = pushWinTimestamp(oldHistory);

        // TODO: Update "rating" only if game was rated
        const stats: TowersPlayerStats = await transaction.towersPlayerStats.update({
          where: { playerId: currentStats.playerId },
          data: {
            gamesCompleted: { increment: 1 },
            wins: { increment: 1 },
            streak: { increment: 1 },
            winHistory: newHistory,
          },
        });

        const isEligibleForHeroCode: boolean = checkIfEligibleForHeroCode(newHistory);

        return { stats, isEligibleForHeroCode };
      },
    );

    return NextResponse.json({ success: true, data: { stats, isEligibleForHeroCode } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
