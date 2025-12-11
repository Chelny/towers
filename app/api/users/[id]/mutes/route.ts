import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { UserMuteFactory } from "@/server/towers/factories/UserMuteFactory";
import { getUserMuteIncludes, UserMuteWithRelations } from "@/types/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { id } = await params;

  try {
    const userMutes: UserMuteWithRelations[] = await prisma.userMute.findMany({
      where: { muterUserId: id },
      include: getUserMuteIncludes(),
    });

    return NextResponse.json(
      {
        success: true,
        data: UserMuteFactory.convertManyToPlainObject(userMutes),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
