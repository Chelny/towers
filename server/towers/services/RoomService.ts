import { TowersRoomWithRelations } from "db";
import prisma from "@/lib/prisma";
import { getTowersRoomIncludes } from "@/prisma/prisma-includes";

export class RoomService {
  public static async getRoomsWithRelations(): Promise<TowersRoomWithRelations[]> {
    return prisma.towersRoom.findMany({
      include: getTowersRoomIncludes(),
    });
  }
}
