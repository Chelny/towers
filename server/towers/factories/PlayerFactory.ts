import { TowersPlayerLite } from "db";
import { Player } from "@/server/towers/classes/Player";
import { PlayerControlKeys } from "@/server/towers/classes/PlayerControlKeys";
import { PlayerStats } from "@/server/towers/classes/PlayerStats";
import { User } from "@/server/towers/classes/User";
import { PlayerStatsFactory } from "@/server/towers/factories/PlayerStatsFactory";
import { UserFactory } from "@/server/towers/factories/UserFactory";

export class PlayerFactory {
  public static createPlayer(dbPlayer: TowersPlayerLite): Player {
    if (!dbPlayer.controlKeys || !dbPlayer.stats) throw Error("Control keys and/or stats not found.");

    const user: User = UserFactory.createUser(dbPlayer.user);
    const controlKeys: PlayerControlKeys = new PlayerControlKeys(dbPlayer.controlKeys);
    const stats: PlayerStats = PlayerStatsFactory.createPlayerStats(dbPlayer.stats);

    return new Player({ id: dbPlayer.id, user, controlKeys, stats });
  }
}
