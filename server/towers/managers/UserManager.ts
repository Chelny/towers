import { User as UserModel } from "db";
import { Socket } from "socket.io";
import { User, UserProps } from "@/server/towers/classes/User";
import { UserService } from "@/server/towers/services/UserService";

export class UserManager {
  private static users: Map<string, User> = new Map<string, User>();

  // ---------- Database Load ------------------------------

  public static async loadUserFromDb(id: string): Promise<User> {
    const db: UserModel | null = await UserService.getUserById(id);
    if (!db) throw new Error(`User ${id} not found`);
    return this.upsert(db);
  }

  // ---------- Basic CRUD ------------------------------

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
      user.image = props.image;

      return user;
    }

    return this.create(props);
  }

  public static delete(id: string): void {
    this.users.delete(id);
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
