import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { RedisEvents } from "@/constants/socket-events";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import "@/lib/redis";
import { getConversationIncludes, getInstantMessageIncludes } from "@/prisma/selects";
import { publishRedisEvent } from "@/server/redis/publish";
import { dynamicActivate } from "@/translations/languages";
import type {
  ConversationParticipant,
  ConversationWithRelations,
  InstantMessageType,
  InstantMessageWithRelations,
} from "db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { conversationId } = await params;

  let text: string | undefined = undefined;
  let type: InstantMessageType | undefined = undefined;
  let textVariables: string | undefined = undefined;
  let visibleToUserId: string | undefined = undefined;

  try {
    const body = await request.json();
    text = body.text;
    type = body.type;
    textVariables = body.textVariables;
    visibleToUserId = body.visibleToUserId;
  } catch {
    // No body sent → defaults stay
  }

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const message: InstantMessageWithRelations = await prisma.instantMessage.create({
      data: {
        conversationId: conversationId,
        userId: session.user.id,
        text,
        type,
        textVariables,
        visibleToUserId,
      },
      include: getInstantMessageIncludes(),
    });

    const participantUserIds: string[] = message.conversation.participants.map(
      (participant: ConversationParticipant) => participant.userId,
    );

    const conversation: ConversationWithRelations | null = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: participantUserIds },
          },
        },
      },
      include: getConversationIncludes(),
    });

    await publishRedisEvent(RedisEvents.CONVERSATION_MESSAGE_SEND, { userIds: participantUserIds, conversation });

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
