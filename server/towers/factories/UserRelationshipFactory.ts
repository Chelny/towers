import { User } from "@/server/towers/classes/User";
import { UserRelationship, UserRelationshipPlainObject } from "@/server/towers/classes/UserRelationship";
import { UserFactory } from "@/server/towers/factories/UserFactory";
import { UserRelationshipWithRelations } from "@/types/prisma";

export class UserRelationshipFactory {
  public static createUserRelationship(dbUserRelationship: UserRelationshipWithRelations): UserRelationship {
    const sourceUser: User = UserFactory.createUser(dbUserRelationship.sourceUser);
    const targetUser: User = UserFactory.createUser(dbUserRelationship.targetUser);

    return new UserRelationship({
      id: dbUserRelationship.id,
      sourceUser,
      targetUser,
      type: dbUserRelationship.type,
      blockReason: dbUserRelationship.blockReason,
      isMuted: dbUserRelationship.isMuted,
    });
  }

  public static convertManyToPlainObject(
    dbUserRelationships: UserRelationshipWithRelations[],
  ): UserRelationshipPlainObject[] {
    return dbUserRelationships.map((dbUserRelationship: UserRelationshipWithRelations) => {
      const userRelationship: UserRelationship = this.createUserRelationship(dbUserRelationship);
      return userRelationship.toPlainObject();
    });
  }
}
