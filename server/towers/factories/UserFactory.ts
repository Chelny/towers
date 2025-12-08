import { UserLite } from "db";
import { User } from "@/server/towers/classes/User";

export class UserFactory {
  public static createUser(dbUser: UserLite): User {
    return new User(dbUser);
  }
}
