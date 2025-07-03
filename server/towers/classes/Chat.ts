import { createId } from "@paralleldrive/cuid2"
import { User, UserPlainObject } from "@/server/towers/classes/User"
import { UserMutePeriod } from "@/server/towers/classes/UserMuteManager"

export interface ChatMessage {
  id: string
  user: User
  text?: string
  createdAt: Date
}

export type NewMessage<T extends ChatMessage> = Omit<T, "id" | "createdAt">

export interface ChatPlainObject {
  messages: ChatMessagePlainObject[]
}

export interface ChatMessagePlainObject {
  id: string
  user: UserPlainObject
  text?: string
  createdAt: string
}

/**
 * Abstract base class for chat systems (e.g., RoomChat, TableChat).
 *
 * Stores a list of chat messages and can be extended for room/table-specific behavior.
 */
export abstract class Chat<T extends ChatMessage> {
  protected messages: T[]

  constructor(messages: T[] = []) {
    this.messages = messages
  }

  /**
   * Adds a new chat message to the chat log with a unique ID and timestamp.
   *
   * @param message - The data for the new message, including user, type, text, and optional visibility options.
   */
  public addMessage(message: NewMessage<T>): void {
    const msg: T = {
      ...message,
      id: createId(),
      createdAt: new Date(),
    } as T

    this.messages.push(msg)
  }

  /**
   * Returns a plain, serializable version of the chat,
   * including only messages that are visible to the given user.
   *
   * Filters out messages from users that the given user has blocked.
   *
   * @param user - The user requesting the chat log. Used for filtering blocked messages.
   * @returns A plain object containing only the visible messages for this user.
   */
  public toPlainObject(user: User): ChatPlainObject {
    return {
      messages: this.messages
        .filter((message) => {
          const periods: UserMutePeriod[] = user.muteManager.getMutePeriods(message.user.user.id)
          if (!periods.length) return true

          // Hide only if message falls inside any mute period
          for (const period of periods) {
            if (message.createdAt >= period.mutedAt && (!period.unmutedAt || message.createdAt < period.unmutedAt)) {
              return false
            }
          }

          return true
        })
        .map((message: T) => ({
          id: message.id,
          user: message.user.toPlainObject(),
          text: message.text,
          createdAt: message.createdAt.toISOString(),
        })),
    }
  }
}
