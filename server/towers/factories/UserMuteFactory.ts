import { UserMuteWithRelations } from "db";
import { User } from "@/server/towers/classes/User";
import { UserMute, UserMutePlainObject } from "@/server/towers/classes/UserMute";
import { UserFactory } from "@/server/towers/factories/UserFactory";

export class UserMuteFactory {
  public static convertManyToPlainObject(dbMutes: UserMuteWithRelations[]): UserMutePlainObject[] {
    return dbMutes.map((dbMute: UserMuteWithRelations) => {
      const muterUser: User = UserFactory.createUser(dbMute.muterUser);
      const mutedUser: User = UserFactory.createUser(dbMute.mutedUser);
      const userMute: UserMute = new UserMute({ id: dbMute.id, muterUser, mutedUser });
      return userMute.toPlainObject();
    });
  }
}
