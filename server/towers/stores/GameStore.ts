import { getCache, removeCache, setCache } from "@/server/redis-cache";
import { Game, GamePlainObject } from "@/server/towers/models/Game";
import { games } from "@/server/towers/state";

const redisKey = (gameId: string) => `towers:game:${gameId}`;

export class GameStore {
  public static async get(gameId: string): Promise<Game | null> {
    const inMemory: Game | undefined = games.get(gameId);
    if (inMemory) return inMemory;

    const cached: GamePlainObject | null = await getCache<GamePlainObject>(redisKey(gameId));
    if (!cached) return null;

    const game: Game = Game.fromJSON(cached);
    games.set(gameId, game);
    return game;
  }

  public static async save(game: Game): Promise<void> {
    games.set(game.id, game);
    await setCache(redisKey(game.id), game.toPlainObject());
  }

  public static async delete(gameId: string): Promise<void> {
    games.delete(gameId);
    await removeCache(redisKey(gameId));
  }
}
