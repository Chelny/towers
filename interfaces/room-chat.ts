import { RoomChat } from "@prisma/client"

/**
 * Create message
 */

export interface RoomChatWithUsername {
  chat: RoomChat[]
  username: string
}

/**
 * Redux
 */

export interface RoomChatMessageInput {
  roomId: string
  message: string
}
