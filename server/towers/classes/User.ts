import { UserSettings as UserSettingsModel } from "db/client";
import { Socket } from "socket.io";
import { UserSettings, UserSettingsPlainObject } from "@/server/towers/classes/UserSettings";

export interface UserProps {
  id: string
  username: string
  image: string | null
  userSettings: UserSettingsModel | null
}

export interface UserPlainObject {
  readonly id: string
  readonly username: string
  readonly image: string | null
  readonly userSettings?: UserSettingsPlainObject
}

export class User {
  public readonly id: string;
  public username: string;
  public image: string | null;
  public userSettings: UserSettings | null = null;
  public socket: Socket | null = null;

  // In-memory properties
  public declineTableInvitations: boolean = false;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.image = props.image ?? null;

    if (props.userSettings) {
      this.userSettings = new UserSettings({
        id: props.userSettings.id,
        avatarId: props.userSettings.avatarId,
        theme: props.userSettings.theme,
        profanityFilter: props.userSettings.profanityFilter,
      });
    } else {
      this.userSettings = null;
    }
  }

  public blockTableInvitations(): void {
    this.declineTableInvitations = true;
  }

  public allowTableInvitations(): void {
    this.declineTableInvitations = false;
  }

  public toPlainObject(): UserPlainObject {
    return {
      id: this.id,
      username: this.username,
      image: this.image,
      userSettings: this.userSettings?.toPlainObject(),
    };
  }
}
