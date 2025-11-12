import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, UserMute } from "db";
import { handleApiError, handleUnauthorizedApiError } from "@/lib/apiError";
import { auth, Session } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/locale";
import prisma from "@/lib/prisma";
import { getUserMuteIncludes } from "@/prisma/selects";
import { dynamicActivate } from "@/translations/languages";

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const { mutedUserId } = await request.json();

  // @ts-ignore
  const session: Session | null = await auth.api.getSession({ headers: await headers() });
  if (!session) return handleUnauthorizedApiError();

  dynamicActivate(getCurrentLocale(request, session));

  try {
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const existingMute: UserMute | null = await transaction.userMute.findUnique({
        where: {
          muterUserId_mutedUserId: {
            muterUserId: session.user.id,
            mutedUserId,
          },
        },
      });

      if (existingMute) {
        // If exists → unmute (delete)
        await transaction.userMute.delete({
          where: { id: existingMute.id },
        });

        return NextResponse.json({ success: true, data: false }, { status: 200 });
      }

      // Otherwise → mute (create)
      await transaction.userMute.create({
        data: {
          muterUserId: session.user.id,
          mutedUserId,
        },
        include: getUserMuteIncludes(),
      });
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
