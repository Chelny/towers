import { Prisma, Room, RoomChat, Table, TableChat, TowersUserProfile, TowersUserRoomTable, User } from "@prisma/client"

declare module "@prisma/client" {
  interface TowersUserProfileWithRelations extends TowersUserProfile {
    user: User
  }

  interface TowersUserRoomTableWithRelations extends TowersUserRoomTable {
    towersUserProfile: TowersUserProfileWithRelations
  }

  /**
   * Room API
   */

  interface RoomListItem extends Room {
    towersUserRoomTables: { towersUserProfileId: string }[]
  }

  interface RoomListItemWithUsersCount extends RoomListItem {
    usersCount: number
  }

  /**
   * Socket Room
   */

  interface RoomInfo extends Room {
    tables: TableInfo[]
  }

  interface RoomInfoWithTablesCount {
    room: RoomInfo
    tablesCount: number
  }

  interface RoomMessage extends RoomChat {
    towersUserProfile: TowersUserProfileWithRelations
  }

  /**
   * Socket Table
   */

  interface TableInfo extends Table {
    room?: Room
    host: TowersUserProfileWithRelations
    towersUserRoomTables: (TowersUserRoomTable & { towersUserProfile: TowersUserProfileWithRelations })[]
  }

  interface TableMessage extends TableChat {
    towersUserProfile: TowersUserProfileWithRelations
  }

  /**
   * Socket Room + Table
   */

  interface TowersUser extends TowersUserRoomTable {
    towersUserProfile: TowersUserProfileWithRelations
    room: Room
    table: Table | null
  }
}
