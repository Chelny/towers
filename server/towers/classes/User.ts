import { Socket } from "socket.io";

export interface UserProps {
  id: string
  username: string
  image: string | null
}

export interface UserPlainObject {
  readonly id: string
  readonly username: string
  readonly image: string | null
}

export class User {
  public readonly id: string;
  public username: string;
  public image: string | null;
  public socket: Socket | null = null;

  // In-memory properties
  public declineTableInvitations: boolean = false;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.image = props.image ?? null;
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
    };
  }
}
