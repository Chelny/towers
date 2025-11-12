import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { TowersPlayerControlKeys } from "db";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const { controlKeys } = await request.json();

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const updatedControlKeys: TowersPlayerControlKeys = await prisma.towersPlayerControlKeys.update({
      where: { playerId: session.user.id },
      data: controlKeys,
    });

    await publishRedisEvent(RedisEvents.GAME_CONTROL_KEYS_UPDATE, {
      userId: session.user.id,
      controlKeys: updatedControlKeys,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
