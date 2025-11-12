import { Redis } from "ioredis";

let redis: Redis | null = null;

export function initRedisPublisher(instance: Redis): void {
  redis = instance;
}

export async function publishRedisEvent<T>(channel: string, payload: T): Promise<void> {
  if (!redis) throw new Error("Redis publisher not initialized");
  await redis.publish(channel, JSON.stringify(payload));
}
