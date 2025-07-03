import {
  TowersGamePlayer,
  TowersPlayerControlKeys,
  TowersPlayerStats,
  TowersRoom,
  TowersRoomChatMessage,
  TowersTable,
  TowersTableChatMessage,
  User,
} from "@prisma/client"

declare module "@prisma/client" {
  // **************************************************
  // * Room
  // **************************************************

  interface ITowersRoom extends TowersRoom {
    tables: ITowersTable[]
    chatMessages: TowersRoomChatMessage[]
  }

  interface ITowersRoomWithUsersCount extends TowersRoom {
    usersCount: number
  }

  interface ITowersRoomChatMessage extends TowersRoomChatMessage {
    room: TowersRoom
    gamePlayer: ITowersGamePlayer
  }

  // **************************************************
  // * Table
  // **************************************************

  interface ITowersTable extends TowersTable {
    room: TowersRoom
    host: ITowersGamePlayer
  }

  interface ITowersTableChatMessage extends TowersTableChatMessage {
    table: TowersTable
    gamePlayer: ITowersGamePlayer
  }

  // **************************************************
  // * Game Player
  // **************************************************

  interface ITowersGamePlayer extends TowersGamePlayer {
    user: User
    controlKeys: TowersPlayerControlKeys
    stats: TowersPlayerStats
  }
}
