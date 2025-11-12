import { getCache, removeCache, setCache } from "@/server/redis-cache";
import { PlayerStats, PlayerStatsPlainObject } from "@/server/towers/models/PlayerStats";
import { playerStats } from "@/server/towers/state";

const redisKey = (playerStatsId: string) => `towers:playerStats:${playerStatsId}`;

export class PlayerStatsStore {
  public static async get(playerStatsId: string): Promise<PlayerStats | null> {
    const inMemory: PlayerStats | undefined = playerStats.get(playerStatsId);
    if (inMemory) return inMemory;

    const cached: PlayerStatsPlainObject | null = await getCache<PlayerStatsPlainObject>(redisKey(playerStatsId));
    if (!cached) return null;

    const playerStat: PlayerStats = PlayerStats.fromJSON(cached);
    playerStats.set(playerStatsId, playerStat);
    return playerStat;
  }

  public static async save(playerStat: PlayerStats): Promise<void> {
    playerStats.set(playerStat.id, playerStat);
    await setCache(redisKey(playerStat.id), playerStat.toPlainObject());
  }

  public static async delete(playerStatsId: string): Promise<void> {
    playerStats.delete(playerStatsId);
    await removeCache(redisKey(playerStatsId));
  }
}
