import { createId } from "@paralleldrive/cuid2"
import { SocketEvents } from "@/constants/socket-events"
import { logger } from "@/lib/logger"
import { Room } from "@/server/towers/classes/Room"
import { User, UserPlainObject } from "./User"

export interface InstantMessagePlainObject {
  id: string
  roomId: string
  sender: UserPlainObject
  recipient: UserPlainObject
  message: string
  createdAt: number
}

const MAX_INSTANT_MESSAGE_LENGTH = 300

/**
 * Manages direct messages within a room.
 * Handles delivery, validation, and block checks between users.
 */
export class InstantMessage {
  public readonly id: string = createId()
  public room: Room
  public readonly sender: User
  public readonly recipient: User

  constructor(room: Room, sender: User, recipient: User) {
    this.room = room
    this.sender = sender
    this.recipient = recipient
  }

  /**
   * Sends a direct message from one user to another within the same room.
   *
   * @param sender - The user sending the message.
   * @param recipient - The user receiving the message.
   * @param content - The message content.
   *
   * @throws If the message is too long or the recipient has blocked the sender.
   */
  public sendInstantMessage(sender: User, recipient: User, content: string): void {
    const trimmedContent: string = content?.trim()

    if (trimmedContent?.length === 0) {
      throw new Error("Cannot send an empty message.")
    }

    if (trimmedContent.length > MAX_INSTANT_MESSAGE_LENGTH) {
      throw new Error(`Direct message exceeds maximum length of ${MAX_INSTANT_MESSAGE_LENGTH} characters.`)
    }

    if (recipient.muteManager.isMuted(sender.user.id)) {
      throw new Error("Recipient has blocked this user.")
    }

    const instantMessage: InstantMessagePlainObject = {
      id: this.id,
      roomId: this.room.id,
      sender: sender.toPlainObject(),
      recipient: recipient.toPlainObject(),
      message: trimmedContent,
      createdAt: Date.now(),
    }

    recipient.socket.emit(SocketEvents.INSTANT_MESSAGE_RECEIVED, instantMessage)
    logger.debug(`Instant Message ${sender.user.username} → ${recipient.user.username}: ${trimmedContent}`)
  }
}
