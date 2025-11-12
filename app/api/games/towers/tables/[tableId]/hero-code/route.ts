import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TableChatMessageType, TowersPlayerWithRelations, TowersTableChatMessageWithRelations } from "db";
import { RedisEvents } from "@/constants/socket-events";
import { getCachedPlayerByUserId } from "@/data/player";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersTableChatMessageIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { CipherHeroManager } from "@/server/towers/game/CipherHeroManager";
import { dynamicActivate } from "@/translations/languages";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { code } = await request.json();
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const player: TowersPlayerWithRelations = await getCachedPlayerByUserId(session.user.id);

    if (code && CipherHeroManager.isGuessedCodeMatchesHeroCode(session.user.id, code)) {
      const chatMessage: TowersTableChatMessageWithRelations = await prisma.towersTableChatMessage.create({
        data: {
          tableId,
          playerId: session.user.id,
          type: TableChatMessageType.HERO_MESSAGE,
          textVariables: { username: player.user?.username },
        },
        include: getTowersTableChatMessageIncludes(),
      });

      CipherHeroManager.removeHeroCode(session.user.id);

      await publishRedisEvent(RedisEvents.TABLE_MESSAGE_SEND, { tableId, chatMessage });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
