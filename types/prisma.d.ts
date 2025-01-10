import {
  Account,
  Prisma,
  TowersRoom,
  TowersRoomChatMessage,
  TowersTable,
  TowersTableChatMessage,
  TowersUserProfile,
  TowersUserRoom,
  TowersUserTable,
  User,
} from "@prisma/client"

declare module "@prisma/client" {
  interface ITowersTableWithRelations extends TowersTable {
    room: TowersRoom
    host: ITowersUserProfileWithRelations
    userTables: ITowersUserTableWithRelations[]
  }

  interface ITowersUserProfileWithRelations extends TowersUserProfile {
    user: User
    userRooms?: ITowersUserRoomWithRelations[]
    userTables?: ITowersUserTableWithRelations[]
  }

  interface ITowersUserRoomWithRelations extends TowersUserRoom {
    userProfile: TowersUserProfile
  }

  interface ITowersUserTableWithRelations extends TowersUserTable {
    userProfile: ITowersUserProfileWithRelations
    table: TowersTable | null
  }

  // **************************************************
  // * Room API
  // **************************************************

  interface IRoomListItem extends TowersRoom {
    userRooms: { userProfileId: string }[]
  }

  interface ITowersRoomWithUsersCount extends TowersRoom {
    usersCount: number
    isUserInRoom: boolean
  }

  // **************************************************
  // * Room
  // **************************************************

  interface ITowersRoom extends TowersRoom {}

  interface ITowersRoomChatMessage extends TowersRoomChatMessage {
    userProfile: ITowersUserProfileWithRelations
  }

  // **************************************************
  // * Table
  // **************************************************

  interface ITowersTable extends ITowersTableWithRelations {}

  interface ITowersTableChatMessage extends TowersTableChatMessage {
    userProfile: ITowersUserProfileWithRelations | null
  }

  // **************************************************
  // * User
  // **************************************************

  interface ITowersUserProfile extends ITowersUserProfileWithRelations {}

  interface ITowersUserRoom extends ITowersUserRoomWithRelations {}

  interface ITowersUserTable extends ITowersUserTableWithRelations {}
}
