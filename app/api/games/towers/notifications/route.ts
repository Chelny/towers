import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { getTowersNotificationIncludes } from "@/prisma/selects";
import { dynamicActivate } from "@/translations/languages";
import type { TowersNotificationWithRelations } from "db";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    const notifications: TowersNotificationWithRelations[] = await prisma.towersNotification.findMany({
      where: { playerId: session.user.id },
      include: getTowersNotificationIncludes(),
    });

    return NextResponse.json({ success: true, data: notifications }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
