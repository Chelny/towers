import { NextRequest, NextResponse } from "next/server";
import { TowersTableWithRelations } from "db";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { getTowersTableIncludes } from "@/prisma/selects";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { roomId } = await params;

  try {
    const tables: TowersTableWithRelations[] = await prisma.towersTable.findMany({
      where: { roomId },
      include: getTowersTableIncludes(),
    });

    return NextResponse.json({ success: true, data: tables }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
