import { Gender, Room, RoomLevel, Table, TableType, TowersGameUser, User, UserStatus } from "@prisma/client"
import "@testing-library/jest-dom"
import { TSessionContextValue } from "@/context"
import {
  BoardBlock,
  RoomWithTablesCount,
  TableWithHostAndTowersGameUsers,
  TowersGameUserWithUser,
  TowersGameUserWithUserAndTables
} from "@/interfaces"

/**
 * Next-auth Session States
 */

export const mockedLoadingSession: TSessionContextValue = {
  data: null,
  status: "loading",
  update: vi.fn()
}

export const mockedUnauthenticatedSession: TSessionContextValue = {
  data: null,
  status: "unauthenticated",
  update: vi.fn()
}

export const mockedAuthenticatedSession: TSessionContextValue = {
  data: {
    user: {
      name: "John Doe",
      username: "john.doe",
      image: "https://example.com/avatar.jpg",
      towersUserId: "233507f9-7f92-45fa-bf34-4eb98944b461"
    },
    account: null,
    isNewUser: false,
    expires: "2024-09-01T00:00:00Z"
  },
  status: "authenticated",
  update: vi.fn()
}

/**
 * Users
 */

export const mockedUser1: User = {
  id: "112dc46f-54cb-43f9-81fa-21080a4fb990",
  name: "John Doe",
  gender: Gender.M,
  birthdate: new Date("2000-01-01"),
  email: "john.doe@example.com",
  username: "john.doe",
  password: "Password123!",
  emailVerified: new Date("2024-09-01"),
  image: "https://example.com/avatar.jpg",
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: UserStatus.ACTIVE,
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * Rooms and Tables
 */

export const mockedRoom1: Room = {
  id: "7b09737d-aca1-4aaf-be74-5b1d40579224",
  name: "Test Room 1",
  difficulty: RoomLevel.SOCIAL,
  full: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom2: Room = {
  id: "864da65d-2328-419e-b9df-fc1b20b8f2ee",
  name: "Test Room 2",
  difficulty: RoomLevel.BEGINNER,
  full: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1: Table = {
  id: "e812b595-1086-484b-9b70-2727ba589060",
  roomId: "7b09737d-aca1-4aaf-be74-5b1d40579224",
  tableNumber: 1,
  hostId: "0113754d-1ae3-42dc-843d-f3886e80ef15",
  tableType: TableType.PUBLIC,
  rated: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersGameUser1: TowersGameUser = {
  id: "0113754d-1ae3-42dc-843d-f3886e80ef15",
  userId: "112dc46f-54cb-43f9-81fa-21080a4fb990",
  roomId: "7b09737d-aca1-4aaf-be74-5b1d40579224",
  tableId: "e812b595-1086-484b-9b70-2727ba589060",
  seatNumber: null,
  rating: 1200,
  gamesCompleted: 13,
  wins: 7,
  loses: 6,
  streak: 4,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1HostWithUser: TowersGameUserWithUser = {
  ...mockedRoom1Table1TowersGameUser1,
  user: mockedUser1
}

export const mockedRoom1Table1TowersGameUsers: TowersGameUserWithUserAndTables[] = [
  {
    ...mockedRoom1Table1HostWithUser,
    table: null
  }
]

export const mockedRoom1Table1WithHostAndTowersGameUsers: TableWithHostAndTowersGameUsers = {
  ...mockedRoom1Table1,
  room: mockedRoom1,
  host: mockedRoom1Table1HostWithUser,
  towersGameUsers: [mockedRoom1Table1HostWithUser]
}

export const mockedRoomWithTablesCount: RoomWithTablesCount = {
  room: {
    ...mockedRoom1,
    tables: [mockedRoom1Table1WithHostAndTowersGameUsers]
  },
  tablesCount: 123
}

/**
 * Socket State
 */

export const mockedSocketStateRooms: Record<string, RoomWithTablesCount | null> = {
  "7b09737d-aca1-4aaf-be74-5b1d40579224": mockedRoomWithTablesCount
}

export const mockedSocketStateTables: Record<string, TableWithHostAndTowersGameUsers | null> = {
  "e812b595-1086-484b-9b70-2727ba589060": mockedRoom1Table1WithHostAndTowersGameUsers
}

/**
 * Board
 */

export const mockedDefaultTowersBlockProps = {
  powerType: null,
  powerLevel: null,
  isToBeRemoved: false,
  brokenBlockNumber: null
}

export const mockedBlockT: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "T" }
export const mockedBlockO: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "O" }
export const mockedBlockW: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "W" }
export const mockedBlockE: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "E" }
export const mockedBlockR: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "R" }
export const mockedBlockS: BoardBlock = { ...mockedDefaultTowersBlockProps, letter: "S" }
export const mockedBlockMedusa: BoardBlock = { letter: "ME" }
export const mockedBlockEmpty: BoardBlock = { letter: " " }
