import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ConversationWithRelations } from "db";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { getConversationIncludes } from "@/prisma/selects";
import { dynamicActivate } from "@/translations/languages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { conversationId } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const conversation: ConversationWithRelations = await prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: getConversationIncludes(),
    });

    return NextResponse.json({ success: true, data: conversation }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
