import { NextRequest, NextResponse } from "next/server";
import { UserMuteWithRelations } from "db";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { getUserMuteIncludes } from "@/prisma/prisma-includes";
import { UserMuteFactory } from "@/server/towers/factories/UserMuteFactory";

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
