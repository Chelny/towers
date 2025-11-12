import { TowersPlayerWithRelations } from "db";
import Redis from "ioredis";
import { REDIS_KEYS } from "@/constants/redis-keys";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { getTowersPlayerFullIncludes } from "@/prisma/selects";

export const getPlayerByUserId = async (userId: string): Promise<TowersPlayerWithRelations> => {
  let player: TowersPlayerWithRelations | null = await prisma.towersPlayer.findUnique({
    where: { id: userId },
    include: getTowersPlayerFullIncludes(),
  });

  if (!player) {
    player = await prisma.towersPlayer.create({
      data: {
        user: { connect: { id: userId } },
        controlKeys: { create: {} },
        stats: { create: {} },
      },
      include: getTowersPlayerFullIncludes(),
    });
  }

  return player;
};

export const getCachedPlayerByUserId = async (userId: string, ttl: number = 60): Promise<TowersPlayerWithRelations> => {
  const redis: Redis = getRedis();

  const cachedPlayer: string | null = await redis.get(REDIS_KEYS.PLAYER(userId));
  if (cachedPlayer) return JSON.parse(cachedPlayer);

  const player: TowersPlayerWithRelations = await getPlayerByUserId(userId);
  await redis.set(REDIS_KEYS.PLAYER(userId), JSON.stringify(player), "EX", ttl);

  return player;
};
