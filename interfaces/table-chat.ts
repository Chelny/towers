import { TableChat } from "@prisma/client"

/**
 * Create message
 */

export interface TableChatWithUsername {
  chat: TableChat[]
  username: string
}

/**
 * Redux
 */

export interface TableChatMessageInput {
  tableId: string
  message: string
}
