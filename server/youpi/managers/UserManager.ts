import { User as UserModel, UserSettings as UserSettingsModel } from "db/client";
import { Socket } from "socket.io";
import { logger } from "@/lib/logger";
import { User, UserProps } from "@/server/youpi/classes/User";
import { UserSettings } from "@/server/youpi/classes/UserSettings";
import { UserService } from "@/server/youpi/services/UserService";

export class UserManager {
  private static users: Map<string, User> = new Map<string, User>();

  // ---------- Database Load ------------------------------

  public static async loadUserFromDb(id: string): Promise<User> {
    const db: (UserModel & { userSettings: UserSettingsModel | null }) | null = await UserService.getUserById(id);
    if (!db) throw new Error(`User ${id} not found`);
    return this.upsert(db);
  }

  // ---------- Basic CRUD ---------------------------------

  public static get(id: string): User | undefined {
    return this.users.get(id);
  }

  public static all(): User[] {
    return [...this.users.values()];
  }

  public static create(props: UserProps): User {
    let user: User | undefined = this.users.get(props.id);
    if (user) return user;

    user = new User(props);
    this.users.set(user.id, user);

    return user;
  }

  public static upsert(props: UserProps): User {
    const user: User | undefined = this.users.get(props.id);

    if (user) {
      user.username = props.username;
      user.userSettings = props.userSettings
        ? new UserSettings({
            id: props.userSettings.id,
            avatarId: props.userSettings.avatarId,
            theme: props.userSettings.theme,
            profanityFilter: props.userSettings.profanityFilter,
          })
        : null;

      return user;
    }

    return this.create(props);
  }

  public static delete(id: string): void {
    this.users.delete(id);
  }

  // ---------- User Actions --------------------------------

  public static blockTableInvitations(userId: string): void {
    const user: User | undefined = this.get(userId);

    if (user) {
      user.blockTableInvitations();
      logger.debug(`${user.username} blocked invitations.`);
    }
  }

  public static allowTableInvitations(userId: string): void {
    const user: User | undefined = this.get(userId);

    if (user) {
      user.allowTableInvitations();
      logger.debug(`${user.username} allow invitations.`);
    }
  }

  // ---------- Socket Actions ------------------------------

  public static getSocket(userId: string): Socket | null {
    const user: User | undefined = this.get(userId);
    return user?.socket ?? null;
  }

  public static attachSocket(userId: string, socket: Socket): void {
    const user: User | undefined = this.get(userId);
    if (user) user.socket = socket;
  }

  public static detachSocket(userId: string): void {
    const user: User | undefined = this.get(userId);
    if (user) user.socket = null;
  }

  public static emitTo(userId: string, event: string, payload: unknown): void {
    const socket: Socket | null = this.getSocket(userId);
    if (socket) socket.emit(event, payload);
  }
}
