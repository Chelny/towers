import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { I18n } from "@lingui/core";
import { initLingui } from "@/app/init-lingui";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/api-error";
import { auth } from "@/lib/auth";
import { Session } from "@/lib/auth-client";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  try {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        language: body.language,
      },
    });

    const i18n: I18n = initLingui(body.language);

    return NextResponse.json(
      {
        success: true,
        message: i18n._("The settings have been updated!"),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
