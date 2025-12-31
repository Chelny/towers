import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { towersRoomsListIncludes, TowersRoomsListWithCount } from "@/types/prisma";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const rooms: TowersRoomsListWithCount[] = await prisma.towersRoom.findMany({
      include: towersRoomsListIncludes,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: rooms,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
