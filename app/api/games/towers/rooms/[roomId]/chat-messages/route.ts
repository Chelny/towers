import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import { TowersRoomChatMessageWithRelations } from "db";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersRoomChatMessageIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { roomId } = await params;

  try {
    const roomChatMessages: TowersRoomChatMessageWithRelations[] = await prisma.towersRoomChatMessage.findMany({
      where: { roomId },
      include: getTowersRoomChatMessageIncludes(),
      take: 500,
    });

    return NextResponse.json({ success: true, data: roomChatMessages }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { text } = await request.json();
  const { roomId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const chatMessage: TowersRoomChatMessageWithRelations = await prisma.towersRoomChatMessage.create({
      data: { roomId, playerId: session.user.id, text },
      include: getTowersRoomChatMessageIncludes(),
    });

    await publishRedisEvent(RedisEvents.ROOM_MESSAGE_SEND, { roomId, chatMessage });

    return NextResponse.json(
      {
        success: true,
        message: t({ message: "The message has been sent." }),
        data: chatMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
