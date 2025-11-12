import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ConversationWithRelations } from "db";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { getConversationIncludes } from "@/prisma/selects";
import { dynamicActivate } from "@/translations/languages";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const conversations: ConversationWithRelations[] = await prisma.conversation.findMany({
      where: { participants: { some: { userId: session.user.id } } },
      include: getConversationIncludes(),
    });

    return NextResponse.json({ success: true, data: conversations }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { conversationId } = await params;

  try {
    await prisma.conversation.delete({
      where: { id: conversationId },
      include: getConversationIncludes(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
