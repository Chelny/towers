import { Redis } from "ioredis";
import superjson from "superjson";

const DEFAULT_TTL_SECONDS: number = 60 * 60 * 24; // 24 hours

let redisClient: Redis | null = null;

export function setRedisClient(client: Redis): void {
  redisClient = client;
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient) return null;
  const data: string | null = await redisClient.get(key);
  return data ? (superjson.parse(data) as T) : null;
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
  if (!redisClient) return;

  const data: string = superjson.stringify(value);

  if (ttlSeconds) {
    await redisClient.setex(key, ttlSeconds, data);
  } else {
    await redisClient.set(key, data);
  }
}

export async function removeCache(key: string): Promise<void> {
  if (!redisClient) return;
  await redisClient.del(key);
}
