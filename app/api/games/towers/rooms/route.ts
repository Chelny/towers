import { NextResponse } from "next/server";
import { TowersRoomsListWithCount } from "db";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { towersRoomsListIncludes } from "@/prisma/selects";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const rooms: TowersRoomsListWithCount[] = await prisma.towersRoom.findMany({
      include: towersRoomsListIncludes,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: rooms }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
