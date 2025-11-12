import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TableType, TowersTablePlayer } from "db";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { dynamicActivate } from "@/translations/languages";

/**
 * Determines if the current player can watch another player at a table.
 *
 * Rules:
 * - Target player must currently be playing in a table.
 * - Allow watching if already seated at the same table.
 * - Private tables can only be watched if current player is in the same table.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { playerId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    // It cannot be the current user
    if (playerId === session.user.id) {
      return NextResponse.json({ success: false, message: "You cannot watch yourself" });
    }

    // Find the table where the target player is currently playing
    const targetTablePlayer = await prisma.towersTablePlayer.findFirst({
      where: {
        playerId,
        // isPlaying: true, // FIXME: Check if player is currently playing
      },
      include: {
        table: {
          select: {
            id: true,
            roomId: true,
            tableType: true,
          },
        },
      },
    });

    if (!targetTablePlayer) {
      return NextResponse.json({ success: false, message: "User is not playing" });
    }

    // Check if current player is already seated at that table
    const isInSameTable: TowersTablePlayer | null = await prisma.towersTablePlayer.findFirst({
      where: {
        tableId: targetTablePlayer.tableId,
        playerId: session.user.id,
      },
    });

    // Check if table is private
    if (targetTablePlayer.table.tableType === TableType.PRIVATE && !isInSameTable) {
      return NextResponse.json({ success: false, message: "Private table — only players in this table can watch" });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          roomId: targetTablePlayer.table.roomId,
          tableId: targetTablePlayer.tableId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
