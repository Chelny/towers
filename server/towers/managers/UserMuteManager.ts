import { createId } from "@paralleldrive/cuid2";
import { ServerInternalEvents } from "@/constants/socket/server-internal";
import { publishRedisEvent } from "@/server/redis/publish";
import { UserMute, UserMuteProps } from "@/server/towers/classes/UserMute";
import { PlayerManager } from "@/server/towers/managers/PlayerManager";

export class UserMuteManager {
  private static userMutes: Map<string, UserMute> = new Map<string, UserMute>();

  // ---------- Basic CRUD ------------------------------

  public static get(id: string): UserMute | undefined {
    return this.userMutes.get(id);
  }

  public static all(): UserMute[] {
    return [...this.userMutes.values()];
  }

  public static async create(props: Omit<UserMuteProps, "id">): Promise<void> {
    const userMute: UserMute = new UserMute({ id: createId(), ...props });
    this.userMutes.set(userMute.id, userMute);
    PlayerManager.updateLastActiveAt(props.muterUser.id);

    await publishRedisEvent(ServerInternalEvents.USER_MUTE, {
      muterUserId: userMute.muterUserId,
      mutedUserId: userMute.mutedUserId,
    });
  }

  public static delete(id: string): void {
    this.userMutes.delete(id);
  }

  // ---------- User Mute Actions ------------------------------

  public static mutedUserIdsFor(muterUserId: string): string[] {
    return this.all()
      .filter((userMute: UserMute) => userMute.muterUserId === muterUserId)
      .map((userMute: UserMute) => userMute.mutedUserId);
  }

  public static async isMuted(muterUserId: string, mutedUserId: string): Promise<boolean> {
    return this.all().some(
      (userMute: UserMute) => userMute.muterUserId === muterUserId && userMute.mutedUserId === mutedUserId,
    );
  }

  public static async unmute(muterUserId: string, mutedUserId: string): Promise<void> {
    for (const [id, userMute] of this.userMutes.entries()) {
      if (userMute.muterUserId === muterUserId && userMute.mutedUserId === mutedUserId) {
        this.userMutes.delete(id);
        break;
      }
    }

    PlayerManager.updateLastActiveAt(muterUserId);
    await publishRedisEvent(ServerInternalEvents.USER_UNMUTE, { muterUserId, mutedUserId });
  }
}
