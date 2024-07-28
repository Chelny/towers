import { Table, TowersGameUser, User } from "@prisma/client"

export interface RoomUsersResponseData {
  roomId: string
  roomUsers: TowersGameUserWithUserAndTables[]
}

export interface TableUsersResponseData {
  tableId: string
  tableUsers: TowersGameUserWithUserAndTables[]
}

export type TowersGameUserWithUser = TowersGameUser & { user: User }

export type TowersGameUserWithUserAndTables = TowersGameUser & { user: User; tables: Table[] }
