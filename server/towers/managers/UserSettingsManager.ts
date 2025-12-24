import { UserSettings as UserSettingsModel } from "db/client";
import { UserSettings, UserSettingsProps } from "@/server/towers/classes/UserSettings";
import { UserSettingsService } from "@/server/towers/services/UserSettingsService";

export class UserSettingsManager {
  private static userSettings: Map<string, UserSettings> = new Map<string, UserSettings>();

  // ---------- Database Load ------------------------------

  public static async loadUserFromDb(id: string): Promise<UserSettings> {
    const db: UserSettingsModel | null = await UserSettingsService.getUserSettingsById(id);
    if (!db) throw new Error(`UserSettings ${id} not found`);
    return this.upsert(db);
  }

  // ---------- Basic CRUD ------------------------------

  public static get(id: string): UserSettings | undefined {
    return this.userSettings.get(id);
  }

  public static all(): UserSettings[] {
    return [...this.userSettings.values()];
  }

  public static create(props: UserSettingsProps): UserSettings {
    let userSetting: UserSettings | undefined = this.userSettings.get(props.id);
    if (userSetting) return userSetting;

    userSetting = new UserSettings(props);
    this.userSettings.set(userSetting.id, userSetting);

    return userSetting;
  }

  public static upsert(props: UserSettingsProps): UserSettings {
    const userSetting: UserSettings | undefined = this.userSettings.get(props.id);

    if (userSetting) {
      userSetting.theme = props.theme;
      userSetting.profanityFilter = props.profanityFilter;

      return userSetting;
    }

    return this.create(props);
  }

  public static delete(id: string): void {
    this.userSettings.delete(id);
  }
}
