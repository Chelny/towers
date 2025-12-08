import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ConversationWithRelations } from "db";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/api-error";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { getConversationIncludes } from "@/prisma/prisma-includes";
import { ConversationFactory } from "@/server/towers/factories/ConversationFactory";
import { dynamicActivate } from "@/translations/languages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { id } = await params;

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const conversation: ConversationWithRelations = await prisma.conversation.findUniqueOrThrow({
      where: { id },
      include: getConversationIncludes(),
    });

    return NextResponse.json(
      {
        success: true,
        data: ConversationFactory.convertToPlainObject(conversation),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { id } = await params;

  try {
    await prisma.conversation.delete({
      where: { id },
      include: getConversationIncludes(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
