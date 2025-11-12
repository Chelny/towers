import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import { TowersTableChatMessageWithRelations } from "db";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getTowersTableChatMessageIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { tableId } = await params;

  try {
    const tableChatMessages: TowersTableChatMessageWithRelations[] = await prisma.towersTableChatMessage.findMany({
      where: { tableId },
      include: getTowersTableChatMessageIncludes(),
      take: 500,
    });

    return NextResponse.json({ success: true, data: tableChatMessages }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { text, type, textVariables, visibleToUserId } = await request.json();
  const { tableId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const chatMessage: TowersTableChatMessageWithRelations = await prisma.towersTableChatMessage.create({
      data: {
        tableId,
        playerId: session.user.id,
        text,
        type,
        textVariables,
        visibleToUserId,
      },
      include: getTowersTableChatMessageIncludes(),
    });

    await publishRedisEvent(RedisEvents.TABLE_MESSAGE_SEND, { tableId, chatMessage });

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
