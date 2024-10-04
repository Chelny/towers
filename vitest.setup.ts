import {
  Room,
  RoomInfoWithTablesCount,
  RoomLevel,
  RoomMessage,
  Table,
  TableInfo,
  TableMessage,
  TableType,
  TowersUser,
  TowersUserProfileWithRelations,
  TowersUserRoomTable,
  User,
  UserStatus
} from "@prisma/client"
import "@testing-library/jest-dom"
import { TSessionContextValue } from "@/context/session-context"
import { BoardBlock } from "@/interfaces/game"
import { RoomsState, SocketState, TablesState } from "@/redux/features/socket-slice"

export const mockedRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn()
}

export const mockedFormInitialState = {
  success: false,
  message: "",
  error: {}
}

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
      id: "112dc46f-54cb-43f9-81fa-21080a4fb990",
      name: "John Doe",
      username: "john.doe",
      image: "https://example.com/avatar.jpg",
      towersUserProfileId: "233507f9-7f92-45fa-bf34-4eb98944b461"
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
  birthdate: new Date("2000-01-01"),
  email: "john.doe@example.com",
  emailVerified: new Date("2024-09-01"),
  pendingEmail: null,
  username: "john.doe",
  password: "Password123!",
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
  birthdate: new Date("1985-05-15"),
  email: "test_jane@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
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
  birthdate: new Date("2000-07-21"),
  email: "test_sam@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
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
  birthdate: null,
  email: "test_chris@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
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
  birthdate: new Date("1992-02-28"),
  email: "test_patricia@example.dev",
  emailVerified: new Date(),
  pendingEmail: null,
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
 * TowersUserProfile
 */

export const mockedRoom1Table1TowersUserProfile1: TowersUserProfileWithRelations = {
  id: "b96a633f-5945-44b2-8075-696a6d09fec2",
  userId: "7b93cba2-f15a-42ac-ac22-3c8bc1fc4799",
  rating: 4159,
  gamesCompleted: 81,
  wins: 5,
  loses: 3,
  streak: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUser1
}

export const mockedRoom1Table1TowersUserProfile2: TowersUserProfileWithRelations = {
  id: "d5850073-736a-4078-af51-73c40fa5eba2",
  userId: "6db799ae-bb22-4257-aed2-58788d3eb6fb",
  rating: 1897,
  gamesCompleted: 97,
  wins: 9,
  loses: 38,
  streak: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUser2
}

export const mockedRoom1Table1TowersUserProfile3: TowersUserProfileWithRelations = {
  id: "3f813c7c-0599-4bee-a641-403a11b32ce8",
  userId: "a20ec552-68a5-4734-9530-e16a5074150d",
  rating: 3677,
  gamesCompleted: 96,
  wins: 15,
  loses: 49,
  streak: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUser3
}

export const mockedRoom1Table1TowersUserProfile4: TowersUserProfileWithRelations = {
  id: "fb12d58f-3123-4f28-bf50-5d34864fbc76",
  userId: "5d6c6316-8edb-4556-90e0-65fe61dd6d5c",
  rating: 1785,
  gamesCompleted: 67,
  wins: 2,
  loses: 40,
  streak: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUser4
}

export const mockedRoom1Table1TowersUserProfile5: TowersUserProfileWithRelations = {
  id: "b797a2ee-c904-4f32-a8a8-69669fd428fd",
  userId: "cd6b72cb-ab7b-4405-b43d-126b620d4e0e",
  rating: 2166,
  gamesCompleted: 38,
  wins: 49,
  loses: 38,
  streak: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockedUser5
}

/**
 * TowersUserRoomTable
 */

export const mockedRoom1Table1TowersUserRoomTable1: TowersUserRoomTable = {
  id: "1a42184f-12e6-4d65-8020-84c5421d2f57",
  towersUserProfileId: "b96a633f-5945-44b2-8075-696a6d09fec2",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  seatNumber: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersUserRoomTable2: TowersUserRoomTable = {
  id: "3e3ca954-4980-4ab4-928b-b0a51a681b0f",
  towersUserProfileId: "d5850073-736a-4078-af51-73c40fa5eba2",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  seatNumber: 2,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersUserRoomTable3: TowersUserRoomTable = {
  id: "86be1b11-2e15-478d-8d62-d3eab7e92590",
  towersUserProfileId: "3f813c7c-0599-4bee-a641-403a11b32ce8",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  seatNumber: 3,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersUserRoomTable4: TowersUserRoomTable = {
  id: "e00ab6af-294b-48f6-b1c7-f1d1dbc42df5",
  towersUserProfileId: "fb12d58f-3123-4f28-bf50-5d34864fbc76",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "be6c9c4c-27cf-4fd1-88b3-ffa834611576",
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockedRoom1Table1TowersUserRoomTable5: TowersUserRoomTable = {
  id: "fe804468-4e7c-4afc-b5c4-7667a9954a22",
  towersUserProfileId: "b797a2ee-c904-4f32-a8a8-69669fd428fd",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableId: "baa53a4c-4764-40d4-9f1d-701ffe1204a8",
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

/**
 * Rooms Socket Data
 */

export const mockedRoom1Info: RoomInfoWithTablesCount = {
  room: {
    ...mockedRoom1,
    tables: [
      {
        ...mockedRoom1Table1,
        host: {
          ...mockedRoom1Table1TowersUserProfile1,
          user: mockedUser1
        },
        towersUserRoomTables: [
          {
            ...mockedRoom1Table1TowersUserRoomTable1,
            towersUserProfile: mockedRoom1Table1TowersUserProfile1
          },
          {
            ...mockedRoom1Table1TowersUserRoomTable2,
            towersUserProfile: mockedRoom1Table1TowersUserProfile2
          },
          {
            ...mockedRoom1Table1TowersUserRoomTable3,
            towersUserProfile: mockedRoom1Table1TowersUserProfile3
          }
        ]
      },
      {
        ...mockedRoom1Table2,
        host: {
          ...mockedRoom1Table1TowersUserProfile2,
          user: mockedUser2
        },
        towersUserRoomTables: [
          {
            ...mockedRoom1Table1TowersUserRoomTable4,
            towersUserProfile: mockedRoom1Table1TowersUserProfile4
          }
        ]
      },
      {
        ...mockedRoom1Table3,
        host: {
          ...mockedRoom1Table1TowersUserProfile3,
          user: mockedUser3
        },
        towersUserRoomTables: [
          {
            ...mockedRoom1Table1TowersUserRoomTable5,
            towersUserProfile: mockedRoom1Table1TowersUserProfile5
          }
        ]
      }
    ]
  },
  tablesCount: 3
}

export const mockedRoom1Chat: RoomMessage[] = []

export const mockedRoom1Users: TowersUser[] = [
  {
    ...mockedRoom1Table1TowersUserRoomTable1,
    towersUserProfile: mockedRoom1Table1TowersUserProfile1,
    room: mockedRoom1,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersUserRoomTable2,
    towersUserProfile: mockedRoom1Table1TowersUserProfile2,
    room: mockedRoom1,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersUserRoomTable3,
    towersUserProfile: mockedRoom1Table1TowersUserProfile3,
    room: mockedRoom1,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersUserRoomTable4,
    towersUserProfile: mockedRoom1Table1TowersUserProfile4,
    room: mockedRoom1,
    table: mockedRoom1Table2
  },
  {
    ...mockedRoom1Table1TowersUserRoomTable5,
    towersUserProfile: mockedRoom1Table1TowersUserProfile5,
    room: mockedRoom1,
    table: mockedRoom1Table3
  }
]

/**
 * Tables Socket Data
 */

export const mockedRoom1Table1Info: TableInfo = {
  ...mockedRoom1Table1,
  room: mockedRoom1,
  host: {
    ...mockedRoom1Table1TowersUserProfile1,
    user: mockedUser1
  },
  towersUserRoomTables: [
    {
      ...mockedRoom1Table1TowersUserRoomTable1,
      towersUserProfile: mockedRoom1Table1TowersUserProfile1
    },
    {
      ...mockedRoom1Table1TowersUserRoomTable1,
      towersUserProfile: mockedRoom1Table1TowersUserProfile2
    },
    {
      ...mockedRoom1Table1TowersUserRoomTable1,
      towersUserProfile: mockedRoom1Table1TowersUserProfile3
    }
  ]
}

export const mockedRoom1Table1Chat: TableMessage[] = []

export const mockedRoom1Table1Users: TowersUser[] = [
  {
    ...mockedRoom1Table1TowersUserRoomTable1,
    towersUserProfile: mockedRoom1Table1TowersUserProfile1,
    room: mockedRoom1,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersUserRoomTable2,
    towersUserProfile: mockedRoom1Table1TowersUserProfile2,
    room: mockedRoom1,
    table: mockedRoom1Table1
  },
  {
    ...mockedRoom1Table1TowersUserRoomTable3,
    towersUserProfile: mockedRoom1Table1TowersUserProfile3,
    room: mockedRoom1,
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
