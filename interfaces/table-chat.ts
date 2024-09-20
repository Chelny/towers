import { TableChat, User } from "@prisma/client"

/**
 * Create message
 */

export interface TableChatWithUsername {
  chat: TableChat[]
  username: string
}

/**
 * Read message
 */

export interface TableChatWithTowersGameUser extends TableChat {
  towersGameUser: {
    user: User
  } | null
}

/**
 * Redux
 */

export interface TableChatMessageInput {
  tableId: string
  towersUserId?: string
  message: string
}
