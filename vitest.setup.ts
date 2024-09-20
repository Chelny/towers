import { Gender, Room, RoomLevel, Table, TableType, TowersGameUser, User, UserStatus } from "@prisma/client"
import "@testing-library/jest-dom"
import { TSessionContextValue } from "@/context"
import {
  BoardBlock,
  RoomChatWithTowersGameUser,
  RoomWithTablesCount,
  TableChatWithTowersGameUser,
  TableWithHostAndTowersGameUsers,
  TowersGameUserWithUserAndTables
} from "@/interfaces"
import { RoomsState, SocketState, TablesState } from "@/redux/features"

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

export const mockedUser2: User = {
  id: "6db799ae-bb22-4257-aed2-58788d3eb6fb",
  name: "Jane Smith",
  gender: "F",
  birthdate: new Date("1985-05-15"),
  email: "test_jane@example.dev",
  emailVerified: new Date(),
  username: "janesmith",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: "ACTIVE",
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedUser3: User = {
  id: "a20ec552-68a5-4734-9530-e16a5074150d",
  name: "Sam Lee",
  gender: "X",
  birthdate: new Date("2000-07-21"),
  email: "test_sam@example.dev",
  emailVerified: new Date(),
  username: "samlee",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: "ACTIVE",
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedUser4: User = {
  id: "5d6c6316-8edb-4556-90e0-65fe61dd6d5c",
  name: "Chris Green",
  gender: null,
  birthdate: null,
  email: "test_chris@example.dev",
  emailVerified: new Date(),
  username: "chrisgreen",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: "ACTIVE",
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedUser5: User = {
  id: "cd6b72cb-ab7b-4405-b43d-126b620d4e0e",
  name: "Patricia White",
  gender: "F",
  birthdate: new Date("1992-02-28"),
  email: "test_patricia@example.dev",
  emailVerified: new Date(),
  username: "patwhite",
  password: "Password123!",
  image: null,
  language: "en",
  isOnline: true,
  lastActiveAt: new Date(),
  status: "ACTIVE",
  bannedAt: null,
  deletionScheduledAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * Rooms
 */

export const mockedRoom1: Room = {
  id: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  name: "Eiffel Tower",
  difficulty: RoomLevel.SOCIAL,
  full: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom2: Room = {
  id: "3d3858f4-2c3a-4ae6-a2ec-2725152618a1",
  name: "Empire State Building",
  difficulty: RoomLevel.BEGINNER,
  full: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom3: Room = {
  id: "a6388cd8-2e74-4d09-add4-23e5d5d31ad2",
  name: "CN Tower",
  difficulty: RoomLevel.ADVANCED,
  full: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * Tables
 */

export const mockedRoom1Table1: Table = {
  id: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableNumber: 1,
  hostId: "b96a633f-5945-44b2-8075-696a6d09fec2",
  tableType: TableType.PUBLIC,
  rated: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table2: Table = {
  id: "be6c9c4c-27cf-4fd1-88b3-ffa834611576",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableNumber: 2,
  hostId: "d5850073-736a-4078-af51-73c40fa5eba2",
  tableType: TableType.PROTECTED,
  rated: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table3: Table = {
  id: "baa53a4c-4764-40d4-9f1d-701ffe1204a8",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableNumber: 3,
  hostId: "3f813c7c-0599-4bee-a641-403a11b32ce8",
  tableType: TableType.PRIVATE,
  rated: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * TowerGameUsers
 */

export const mockedRoom1Table1TowersGameUser1: TowersGameUser = {
  id: "b96a633f-5945-44b2-8075-696a6d09fec2",
  userId: "7b93cba2-f15a-42ac-ac22-3c8bc1fc4799",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  seatNumber: 1,
  rating: 4159,
  gamesCompleted: 81,
  wins: 5,
  loses: 3,
  streak: 4,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersGameUser2: TowersGameUser = {
  id: "d5850073-736a-4078-af51-73c40fa5eba2",
  userId: "6db799ae-bb22-4257-aed2-58788d3eb6fb",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  seatNumber: 2,
  rating: 1897,
  gamesCompleted: 97,
  wins: 9,
  loses: 38,
  streak: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersGameUser3: TowersGameUser = {
  id: "3f813c7c-0599-4bee-a641-403a11b32ce8",
  userId: "a20ec552-68a5-4734-9530-e16a5074150d",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  seatNumber: 3,
  rating: 3677,
  gamesCompleted: 96,
  wins: 15,
  loses: 49,
  streak: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersGameUser4: TowersGameUser = {
  id: "fb12d58f-3123-4f28-bf50-5d34864fbc76",
  userId: "5d6c6316-8edb-4556-90e0-65fe61dd6d5c",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "be6c9c4c-27cf-4fd1-88b3-ffa834611576",
  seatNumber: null,
  rating: 1785,
  gamesCompleted: 67,
  wins: 2,
  loses: 40,
  streak: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersGameUser5: TowersGameUser = {
  id: "b797a2ee-c904-4f32-a8a8-69669fd428fd",
  userId: "cd6b72cb-ab7b-4405-b43d-126b620d4e0e",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "baa53a4c-4764-40d4-9f1d-701ffe1204a8",
  seatNumber: null,
  rating: 2166,
  gamesCompleted: 38,
  wins: 49,
  loses: 38,
  streak: 3,
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * Rooms Socket Data
 */

export const mockedRoom1Info: RoomWithTablesCount = {
  room: {
    ...mockedRoom1,
    tables: [
      {
        ...mockedRoom1Table1,
        host: {
          ...mockedRoom1Table1TowersGameUser1,
          user: mockedUser1
        },
        towersGameUsers: [
          {
            ...mockedRoom1Table1TowersGameUser1,
            user: mockedUser1
          },
          {
            ...mockedRoom1Table1TowersGameUser2,
            user: mockedUser2
          },
          {
            ...mockedRoom1Table1TowersGameUser3,
            user: mockedUser3
          }
        ]
      },
      {
        ...mockedRoom1Table2,
        host: {
          ...mockedRoom1Table1TowersGameUser2,
          user: mockedUser2
        },
        towersGameUsers: [
          {
            ...mockedRoom1Table1TowersGameUser4,
            user: mockedUser4
          }
        ]
      },
      {
        ...mockedRoom1Table3,
        host: {
          ...mockedRoom1Table1TowersGameUser3,
          user: mockedUser3
        },
        towersGameUsers: [
          {
            ...mockedRoom1Table1TowersGameUser5,
            user: mockedUser5
          }
        ]
      }
    ]
  },
  tablesCount: 3
}

export const mockedRoom1Chat: RoomChatWithTowersGameUser[] = []

export const mockedRoom1Users: TowersGameUserWithUserAndTables[] = [
  {
    ...mockedRoom1Table1TowersGameUser1,
    user: mockedUser1,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersGameUser2,
    user: mockedUser2,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersGameUser3,
    user: mockedUser3,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersGameUser4,
    user: mockedUser4,
    table: mockedRoom1Table2
  },
  {
    ...mockedRoom1Table1TowersGameUser5,
    user: mockedUser5,
    table: mockedRoom1Table3
  }
]

/**
 * Tables Socket Data
 */

export const mockedRoom1Table1Info: TableWithHostAndTowersGameUsers = {
  ...mockedRoom1Table1,
  room: mockedRoom1,
  host: {
    ...mockedRoom1Table1TowersGameUser1,
    user: mockedUser1
  },
  towersGameUsers: [
    {
      ...mockedRoom1Table1TowersGameUser1,
      user: mockedUser1
    },
    {
      ...mockedRoom1Table1TowersGameUser2,
      user: mockedUser2
    },
    {
      ...mockedRoom1Table1TowersGameUser3,
      user: mockedUser3
    }
  ]
}

export const mockedRoom1Table1Chat: TableChatWithTowersGameUser[] = []

export const mockedRoom1Table1Users: TowersGameUserWithUserAndTables[] = [
  {
    ...mockedRoom1Table1TowersGameUser1,
    user: mockedUser1,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersGameUser2,
    user: mockedUser2,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersGameUser3,
    user: mockedUser3,
    table: mockedRoom1Table1
  }
]

/**
 * Socket State
 */

export const mockedSocketRoom1Id: string = mockedRoom1.id
export const mockedSocketRoom2Id: string = mockedRoom2.id
export const mockedSocketRoom3Id: string = mockedRoom3.id

export const mockedSocketStateRooms: Record<string, RoomsState> = {
  [mockedSocketRoom1Id]: {
    roomInfo: mockedRoom1Info,
    isRoomInfoLoading: false,
    chat: mockedRoom1Chat,
    isChatLoading: false,
    users: mockedRoom1Users,
    isUsersLoading: false
  }
  // [mockedSocketRoom2Id]: {},
  // [mockedSocketRoom3Id]: {},
}

export const mockedSocketRoom1Table1Id: string = mockedRoom1Table1.id
export const mockedSocketRoom1Table2Id: string = mockedRoom1Table2.id
export const mockedSocketRoom1Table3Id: string = mockedRoom1Table3.id

export const mockedSocketStateTables: Record<string, TablesState> = {
  [mockedSocketRoom1Table1Id]: {
    tableInfo: mockedRoom1Table1Info,
    isTableInfoLoading: false,
    chat: mockedRoom1Table1Chat,
    isChatLoading: false,
    users: mockedRoom1Users,
    isUsersLoading: false
  }
  // [mockedSocketRoom1Table2Id]: {},
  // [mockedSocketRoom1Table3Id]: {},
}

export const mockedSocketInitialState: SocketState = {
  isLoading: false,
  isConnected: false,
  rooms: {},
  tables: {},
  errorMessage: undefined
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
