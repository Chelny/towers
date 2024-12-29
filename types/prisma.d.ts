import {
  Account,
  Prisma,
  TowersRoom,
  TowersRoomChatMessage,
  TowersTable,
  TowersTableChatMessage,
  TowersUserProfile,
  TowersUserRoomTable,
  User,
} from "@prisma/client"
import { Session } from "@/lib/auth-client"

declare module "@prisma/client" {
  interface IUserWithRelations extends User {
    towersUserProfile?: TowersUserProfileWithRelations
  }

  interface IUserProfile extends User {
    accounts: Account[]
  }

  interface ITowersTableWithRelations extends TowersTable {
    host: ITowersUserProfileWithRelations
    userRoomTables?: ITowersUserRoomTableWithRelations[]
  }

  interface ITowersUserProfileWithRelations extends TowersUserProfile {
    user: Session["user"]
    userRoomTables?: ITowersUserRoomTableWithRelations[]
  }

  interface ITowersUserRoomTableWithRelations extends TowersUserRoomTable {
    userProfile: ITowersUserProfileWithRelations
    table: TowersTable
  }

  // **************************************************
  // * Room API
  // **************************************************

  interface IRoomListItem extends TowersRoom {
    userRoomTables: { userProfileId: string }[]
  }

  interface ITowersRoomWithUsersCount extends TowersRoom {
    usersCount: number
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

  interface ITowersUserRoomTable extends ITowersUserRoomTableWithRelations {}
}
