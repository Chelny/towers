import { createId } from "@paralleldrive/cuid2";
import { ServerInternalEvents } from "@/constants/socket/server-internal";
import { publishRedisEvent } from "@/server/redis/publish";
import { Conversation } from "@/server/towers/classes/Conversation";
import { ConversationParticipant, ConversationParticipantProps } from "@/server/towers/classes/ConversationParticipant";

export class ConversationParticipantManager {
  private static conversationParticipants: Map<string, ConversationParticipant> = new Map<
    string,
    ConversationParticipant
  >();

  // ---------- Basic CRUD ------------------------------

  public static get(id: string): ConversationParticipant | undefined {
    return this.conversationParticipants.get(id);
  }

  public static all(): ConversationParticipant[] {
    return [...this.conversationParticipants.values()];
  }

  public static create(props: Omit<ConversationParticipantProps, "id">): ConversationParticipant {
    const conversationParticipant: ConversationParticipant = new ConversationParticipant({ id: createId(), ...props });
    this.conversationParticipants.set(conversationParticipant.id, conversationParticipant);
    return conversationParticipant;
  }

  public static update(props: ConversationParticipantProps): void {
    const conversationParticipant: ConversationParticipant | undefined = this.get(props.id);
    if (!conversationParticipant) return;
    conversationParticipant.user = props.user;
  }

  public static delete(id: string): void {
    this.conversationParticipants.delete(id);
  }

  // ---------- Conversation Participant Actions ------------------------------

  public static getParticipantByConversationIdAndUserId(
    conversationId: string,
    userId: string,
  ): ConversationParticipant | undefined {
    return this.all().find(
      (cp: ConversationParticipant) => cp.conversationId === conversationId && cp.userId === userId,
    );
  }

  public static getOtherParticipant(conversationId: string, userId: string): ConversationParticipant | undefined {
    return this.all().find(
      (cp: ConversationParticipant) => cp.conversationId === conversationId && cp.userId !== userId,
    );
  }

  public static async markConversationAsRead(
    conversationId: string,
    userId: string,
    unreadConversationsCount: number,
  ): Promise<void> {
    const conversationParticipant: ConversationParticipant | undefined = this.all().find(
      (cp: ConversationParticipant) => cp.conversationId === conversationId && cp.userId === userId,
    );
    if (!conversationParticipant) return undefined;

    conversationParticipant.markAsRead();
    this.conversationParticipants.set(conversationParticipant.id, conversationParticipant);

    await publishRedisEvent(ServerInternalEvents.CONVERSATION_MARK_AS_READ, {
      userId,
      conversationId: conversationParticipant.conversationId,
      unreadConversationsCount,
    });
  }

  public static async muteConversationForUser(
    conversationId: string,
    userId: string,
    unreadConversationsCount: number,
  ): Promise<void> {
    const conversationParticipant: ConversationParticipant | undefined = this.all().find(
      (cp: ConversationParticipant) => cp.conversationId === conversationId && cp.userId === userId,
    );
    if (!conversationParticipant) return undefined;

    if (!conversationParticipant.mutedAt) {
      conversationParticipant.muteConversation();
      this.conversationParticipants.set(conversationParticipant.id, conversationParticipant);
      await publishRedisEvent(ServerInternalEvents.CONVERSATION_MUTE, {
        userId,
        conversationId,
        unreadConversationsCount,
      });
    }
  }

  public static async unmuteConversationForUser(
    conversationId: string,
    userId: string,
    unreadConversationsCount: number,
  ): Promise<void> {
    const conversationParticipant = this.all().find(
      (cp: ConversationParticipant) => cp.conversationId === conversationId && cp.userId === userId,
    );
    if (!conversationParticipant) return;

    if (conversationParticipant.mutedAt) {
      conversationParticipant.unmuteConversation();
      this.conversationParticipants.set(conversationParticipant.id, conversationParticipant);
      await publishRedisEvent(ServerInternalEvents.CONVERSATION_UNMUTE, {
        userId,
        conversationId,
        unreadConversationsCount,
      });
    }
  }

  public static async removeConversationForUser(
    conversationId: string,
    userId: string,
    unreadConversationsCount: number,
  ): Promise<void> {
    const conversationParticipant: ConversationParticipant | undefined = this.all().find(
      (cp: ConversationParticipant) => cp.conversationId === conversationId && cp.userId === userId,
    );
    if (!conversationParticipant) return undefined;

    if (!conversationParticipant.removedAt) {
      conversationParticipant.removeConversation();
      this.conversationParticipants.set(conversationParticipant.id, conversationParticipant);
      await publishRedisEvent(ServerInternalEvents.CONVERSATION_REMOVE, {
        userId,
        conversationId,
        unreadConversationsCount,
      });
    }
  }

  public static async restoreConversationForUser(
    conversation: Conversation,
    userId: string,
    unreadConversationsCount: number,
  ): Promise<void> {
    const conversationParticipant = this.all().find(
      (cp: ConversationParticipant) => cp.conversationId === conversation.id && cp.userId === userId,
    );
    if (!conversationParticipant) return;

    if (conversationParticipant.removedAt) {
      conversationParticipant.restoreConversation();
      this.conversationParticipants.set(conversationParticipant.id, conversationParticipant);
      await publishRedisEvent(ServerInternalEvents.CONVERSATION_RESTORE, {
        userId,
        conversation: conversation.toPlainObject(),
        unreadConversationsCount,
      });
    }
  }
}
