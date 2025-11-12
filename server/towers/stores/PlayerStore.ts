import { getCache, removeCache, setCache } from "@/server/redis-cache";
import { Player, PlayerPlainObject } from "@/server/towers/models/Player";
import { players } from "@/server/towers/state";

const redisKey = (playerId: string) => `towers:player:${playerId}`;

export class PlayerStore {
  public static async get(playerId: string): Promise<Player | null> {
    const inMemory: Player | undefined = players.get(playerId);
    if (inMemory) return inMemory;

    const cached: PlayerPlainObject | null = await getCache<PlayerPlainObject>(redisKey(playerId));
    if (!cached) return null;

    const player: Player = Player.fromJSON(cached);
    players.set(playerId, player);
    return player;
  }

  public static async save(player: Player): Promise<void> {
    players.set(player.id, player);
    await setCache(redisKey(player.id), player.toPlainObject());
  }

  public static async delete(playerId: string): Promise<void> {
    players.delete(playerId);
    await removeCache(redisKey(playerId));
  }
}
