import { User, UserPlainObject } from "@/server/towers/classes/User";

export interface UserMuteProps {
  id: string
  muterUser: User
  mutedUser: User
}

export interface UserMutePlainObject {
  readonly id: string
  readonly muterUserId: string
  readonly muterUser: UserPlainObject
  readonly mutedUserId: string
  readonly mutedUser: UserPlainObject
}

/**
 * Manages a per-user ignore/mute list.
 * Mutes chat messages only.
 */
export class UserMute {
  public readonly id: string;
  public muterUserId: string;
  private _muterUser: User;
  public mutedUserId: string;
  private _mutedUser: User;

  constructor(userMute: UserMuteProps) {
    this.id = userMute.id;
    this.muterUserId = userMute.muterUser.id;
    this._muterUser = userMute.muterUser;
    this.mutedUserId = userMute.mutedUser.id;
    this._mutedUser = userMute.mutedUser;
  }

  public get muterUser(): User {
    return this._muterUser;
  }

  public set muterUser(muterUser: User) {
    this._muterUser = muterUser;
    this.muterUserId = muterUser.id;
  }

  public get mutedUser(): User {
    return this._mutedUser;
  }

  public set mutedUser(mutedUser: User) {
    this._mutedUser = mutedUser;
    this.mutedUserId = mutedUser.id;
  }

  public toPlainObject(): UserMutePlainObject {
    return {
      id: this.id,
      muterUserId: this.muterUserId,
      muterUser: this.muterUser.toPlainObject(),
      mutedUserId: this.mutedUserId,
      mutedUser: this.mutedUser.toPlainObject(),
    };
  }
}
