import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ConversationParticipant } from "db";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; userId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { conversationId, userId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const conversationParticipant: ConversationParticipant = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { readAt: new Date() },
    });

    await publishRedisEvent(RedisEvents.CONVERSATION_MESSAGE_READ, {
      userId: session.user.id,
      conversationId: conversationParticipant.conversationId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
