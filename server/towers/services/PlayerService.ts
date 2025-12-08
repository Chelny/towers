import { TowersPlayerLite } from "db";
import prisma from "@/lib/prisma";
import { getTowersPlayerLiteIncludes } from "@/prisma/prisma-includes";

export class PlayerService {
  public static async getPlayerById(id: string): Promise<TowersPlayerLite> {
    return await prisma.towersPlayer.upsert({
      where: { id },
      update: {},
      create: {
        user: { connect: { id } },
        controlKeys: { create: {} },
        stats: { create: {} },
      },
      include: getTowersPlayerLiteIncludes(),
    });
  }
}
