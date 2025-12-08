import { NextResponse } from "next/server";
import { TowersRoomsListWithCount } from "db";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { towersRoomsListIncludes } from "@/prisma/prisma-includes";
import { RoomFactory } from "@/server/towers/factories/RoomFactory";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const rooms: TowersRoomsListWithCount[] = await prisma.towersRoom.findMany({
      include: towersRoomsListIncludes,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: RoomFactory.convertManyToPlainObject(rooms),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
