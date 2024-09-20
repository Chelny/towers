import { RoomChat, User } from "@prisma/client"

/**
 * Create message
 */

export interface RoomChatWithUsername {
  chat: RoomChat[]
  username: string
}

/**
 * Read message
 */

export interface RoomChatWithTowersGameUser extends RoomChat {
  towersGameUser: {
    user: User
  }
}

/**
 * Redux
 */

export interface RoomChatMessageInput {
  roomId: string
  towersUserId: string
  message: string
}
