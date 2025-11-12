import Redis from "ioredis";
import { logger } from "@/lib/logger";
import { initRedisPublisher } from "@/server/redis/publish";

let redisClient: Redis | null = null;

export const getRedis = (): Redis => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  });

  initRedisPublisher(redisClient);

  redisClient.on("ready", (): void => {
    logger.info("Redis client connection successful.");
  });

  redisClient.on("error", (error: Error): void => {
    logger.error(`Redis client connection error: ${error}`);
    process.exit(1);
  });

  return redisClient;
};
