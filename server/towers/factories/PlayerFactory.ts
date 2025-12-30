import { Player } from "@/server/towers/classes/Player";
import { PlayerControlKeys } from "@/server/towers/classes/PlayerControlKeys";
import { PlayerStats } from "@/server/towers/classes/PlayerStats";
import { PlayerStatsFactory } from "@/server/towers/factories/PlayerStatsFactory";
import { User } from "@/server/youpi/classes/User";
import { UserFactory } from "@/server/youpi/factories/UserFactory";
import { TowersPlayerLite } from "@/types/prisma";

export class PlayerFactory {
  public static createPlayer(dbPlayer: TowersPlayerLite): Player {
    if (!dbPlayer.controlKeys || !dbPlayer.stats) throw Error("Control keys and/or stats not found.");

    const user: User = UserFactory.createUser(dbPlayer.user);
    const controlKeys: PlayerControlKeys = new PlayerControlKeys(dbPlayer.controlKeys);
    const stats: PlayerStats = PlayerStatsFactory.createPlayerStats(dbPlayer.stats);

    return new Player({ id: dbPlayer.id, user, controlKeys, stats });
  }
}
