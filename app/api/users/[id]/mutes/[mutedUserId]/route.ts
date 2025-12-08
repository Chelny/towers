import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; mutedUserId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { id, mutedUserId } = await params;

  try {
    await prisma.userMute.delete({
      where: {
        muterUserId_mutedUserId: {
          muterUserId: id,
          mutedUserId,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
