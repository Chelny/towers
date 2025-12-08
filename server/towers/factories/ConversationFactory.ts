import { ConversationParticipantWithRelations, ConversationWithRelations, InstantMessageWithRelations } from "db";
import { Conversation, ConversationPlainObject } from "@/server/towers/classes/Conversation";
import { ConversationParticipant } from "@/server/towers/classes/ConversationParticipant";
import { InstantMessage } from "@/server/towers/classes/InstantMessage";
import { User } from "@/server/towers/classes/User";
import { UserFactory } from "@/server/towers/factories/UserFactory";

export class ConversationFactory {
  public static createConversation(dbConversation: ConversationWithRelations): Conversation {
    const participants: ConversationParticipant[] = dbConversation.participants.map(
      (cp: ConversationParticipantWithRelations) => {
        const user: User = UserFactory.createUser(cp.user);
        return new ConversationParticipant({ ...cp, user });
      },
    );

    const messages: InstantMessage[] = dbConversation.messages.map((im: InstantMessageWithRelations) => {
      const user: User = UserFactory.createUser(im.user);
      return new InstantMessage({ ...im, user });
    });

    return new Conversation({ id: dbConversation.id, participants, messages });
  }

  public static convertManyToPlainObject(dbConversations: ConversationWithRelations[]): ConversationPlainObject[] {
    return dbConversations.map((dbConversation: ConversationWithRelations) => {
      return this.convertToPlainObject(dbConversation);
    });
  }

  public static convertToPlainObject(dbPlayerStat: ConversationWithRelations): ConversationPlainObject {
    const conversation: Conversation = this.createConversation(dbPlayerStat);
    return conversation.toPlainObject();
  }
}
