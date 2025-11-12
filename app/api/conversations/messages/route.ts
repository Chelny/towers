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
import type { ConversationParticipant, ConversationWithRelations, InstantMessageWithRelations, Prisma } from "db";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const { recipientId, text } = await request.json();

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const { message, participantUserIds, conversation } = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        let conversation: ConversationWithRelations | null = await transaction.conversation.findFirst({
          where: {
            participants: {
              every: {
                userId: { in: [session.user.id, recipientId] },
              },
            },
          },
          include: getConversationIncludes(),
        });

        if (!conversation) {
          conversation = await transaction.conversation.create({
            data: {
              participants: {
                create: [{ userId: session.user.id }, { userId: recipientId }],
              },
            },
            include: getConversationIncludes(),
          });
        }

        const message: InstantMessageWithRelations = await transaction.instantMessage.create({
          data: {
            conversationId: conversation.id,
            userId: session.user.id,
            text,
          },
          include: getInstantMessageIncludes(),
        });

        const participantUserIds: string[] = message.conversation.participants.map(
          (participant: ConversationParticipant) => participant.userId,
        );

        conversation = await transaction.conversation.findFirst({
          where: {
            participants: {
              every: {
                userId: { in: participantUserIds },
              },
            },
          },
          include: getConversationIncludes(),
        });

        return { message, participantUserIds, conversation };
      },
    );

    if (participantUserIds && conversation) {
      await publishRedisEvent(RedisEvents.CONVERSATION_MESSAGE_SEND, { userIds: participantUserIds, conversation });
    }

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
