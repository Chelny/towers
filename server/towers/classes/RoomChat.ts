import { SocketEvents } from "@/constants/socket-events"
import { Chat, ChatMessage, ChatMessagePlainObject, NewMessage } from "@/server/towers/classes/Chat"
import { User } from "@/server/towers/classes/User"

export interface RoomChatPlainObject {
  messages: ChatMessagePlainObject[]
}

/**
 * Chat specific to a room.
 */
export class RoomChat extends Chat<ChatMessage> {
  private roomId: string

  constructor(roomId: string, messages: ChatMessage[] = []) {
    super(messages)
    this.roomId = roomId
  }

  /**
   * @inheritdoc
   *
   * Also emits a Socket.IO event to update clients in the room.
   */
  public override addMessage(message: NewMessage<ChatMessage>): void {
    super.addMessage(message)
    message.user.io.to(this.roomId).emit(SocketEvents.ROOM_CHAT_UPDATED)
  }

  /**
   * @inheritdoc
   */
  public override toPlainObject(user: User): RoomChatPlainObject {
    return super.toPlainObject(user)
  }
}
