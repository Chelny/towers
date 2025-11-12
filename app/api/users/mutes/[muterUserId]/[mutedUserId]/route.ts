import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { getUserMuteIncludes } from "@/prisma/selects";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ muterUserId: string; mutedUserId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { muterUserId, mutedUserId } = await params;

  try {
    await prisma.userMute.delete({
      where: {
        muterUserId_mutedUserId: {
          muterUserId,
          mutedUserId,
        },
      },
      include: getUserMuteIncludes(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
