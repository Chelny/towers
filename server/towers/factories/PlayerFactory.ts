import prisma from "@/lib/prisma";
import { Player } from "@/server/towers/models/Player";
import { PlayerStats } from "@/server/towers/models/PlayerStats";

export class PlayerFactory {
  private static cache: Map<string, Player> = new Map<string, Player>();

  public static async load(playerId: string): Promise<Player | null> {
    if (this.cache.has(playerId)) return this.cache.get(playerId)!;

    const playerData = await prisma.towersPlayer.findUnique({
      where: { id: playerId },
      include: {
        user: { select: { username: true } },
        stats: true,
      },
    });

    if (!playerData) return null;

    const username: string = playerData.user.username;
    const stats: PlayerStats = playerData.stats
      ? new PlayerStats(playerData.stats)
      : await PlayerStats.load(playerData.id);

    const player: Player = new Player(playerData.id, username, stats);

    this.cache.set(player.id, player);

    return player;
  }

  public static async loadMany(playerIds: string[]): Promise<Player[]> {
    const result: Player[] = [];
    const toFetch: string[] = [];

    for (const id of playerIds) {
      const cached: Player | undefined = this.cache.get(id);

      if (cached) {
        result.push(cached);
      } else {
        toFetch.push(id);
      }
    }

    if (toFetch.length) {
      const players = await prisma.towersPlayer.findMany({
        where: { id: { in: toFetch } },
        include: {
          user: { select: { username: true } },
          stats: true,
        },
      });

      for (const data of players) {
        const stats: PlayerStats = data.stats ? new PlayerStats(data.stats) : await PlayerStats.load(data.id);

        const player: Player = new Player(data.id, data.user.username, stats);
        this.cache.set(player.id, player);
        result.push(player);
      }
    }

    return result;
  }

  public static evict(playerId: string): void {
    this.cache.delete(playerId);
  }

  public static clear(): void {
    this.cache.clear();
  }
}
