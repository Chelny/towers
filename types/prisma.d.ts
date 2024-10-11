import {
  Prisma,
  TowersRoom,
  TowersRoomChatMessage,
  TowersTable,
  TowersTableChatMessage,
  TowersUserProfile,
  User,
} from "@prisma/client"

declare module "@prisma/client" {
  interface IUserWithRelations extends User {
    towersUserProfile?: TowersUserProfile
  }

  interface ITowersTableWithRelations extends TowersTable {
    room?: TowersRoom
  }

  interface ITowersUserProfileWithRelations extends TowersUserProfile {
    user: User
    room?: TowersRoom | null
    table?: TowersTable | null
  }

  // **************************************************
  // * Socket Room API
  // **************************************************

  interface IRoomListItem extends TowersRoom {
    userProfiles: { id: string }[]
  }

  interface IRoomListItemWithUsersCount extends IRoomListItem {
    usersCount: number
  }

  // **************************************************
  // * Socket Room
  // **************************************************

  interface ITowersRoom extends TowersRoom {}

  interface ITowersRoomChatMessage extends TowersRoomChatMessage {
    user: IUserWithRelations
  }

  // **************************************************
  // * Socket Table
  // **************************************************

  interface ITowersTable extends ITowersTableWithRelations {
    host: IUserWithRelations
    userProfiles: ITowersUserProfileWithRelations[]
  }

  interface ITowersTableChatMessage extends TowersTableChatMessage {
    user: IUserWithRelations | null
  }

  // **************************************************
  // * Socket Room + Table
  // **************************************************

  interface ITowersUserProfile extends ITowersUserProfileWithRelations {}
}
