import { FKey } from "@/constants/f-key-messages"
import { SocketEvents } from "@/constants/socket-events"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TableType } from "@/enums/table-type"
import { Chat, ChatMessage, ChatMessagePlainObject, NewMessage } from "@/server/towers/classes/Chat"
import { User } from "@/server/towers/classes/User"
import { UserMutePeriod } from "@/server/towers/classes/UserMuteManager"

export interface TableChatMessage extends ChatMessage {
  type: TableChatMessageType
  messageVariables?: TableChatMessageVariables
  visibleToUserId?: string
}

export interface TableChatMessageVariables {
  encryptedChar?: string
  decryptedChar?: string
  fKey?: FKey
  newRating?: number
  oldRating?: number
  heroCode?: string
  tableHostUsername?: string
  tableType?: TableType
  username?: string
}

export interface TableChatPlainObject {
  messages: ChatMessagePlainObject[]
}

export interface TableChatMessagePlainObject extends ChatMessagePlainObject {
  type: TableChatMessageType
  messageVariables?: TableChatMessageVariables
  visibleToUserId?: string
}

/**
 * Chat specific to a table.
 */
export class TableChat extends Chat<TableChatMessage> {
  private tableId: string

  constructor(tableId: string, messages: TableChatMessage[] = []) {
    super(messages)
    this.tableId = tableId
  }

  /**
   * @inheritdoc
   *
   * Also emits a Socket.IO event to update clients at the table.
   */
  public override addMessage(message: NewMessage<TableChatMessage>): void {
    super.addMessage(message)
    message.user.io.to(this.tableId).emit(SocketEvents.TABLE_CHAT_UPDATED)
  }

  /**
   * @inheritdoc
   *
   * Also filters out messages that have `visibleToUserId` set for someone else.
   */
  public toPlainObject(user: User): TableChatPlainObject {
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
        .map((message: TableChatMessage) => ({
          id: message.id,
          user: message.user.toPlainObject(),
          text: message.text,
          type: message.type,
          messageVariables: message.messageVariables,
          visibleToUserId: message.visibleToUserId,
          createdAt: message.createdAt.toISOString(),
        })),
    }
  }
}
