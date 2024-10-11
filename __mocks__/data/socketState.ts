import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  ITowersUserProfile,
  TableChatMessageType
} from "@prisma/client"
import { mockRoom1, mockRoom2, mockRoom3 } from "@/__mocks__/data/rooms"
import { mockRoom1Table1, mockRoom1Table2, mockRoom1Table3 } from "@/__mocks__/data/tables"
import {
  mockRoom1Table1ChatUser1,
  mockRoom1Table1ChatUser2,
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2,
  mockRoom1Table1TowersUserProfile3,
  mockRoom1Table1TowersUserProfile4,
  mockRoom1Table1TowersUserProfile5
} from "@/__mocks__/data/towersUserProfiles"
import { mockUser1, mockUser2, mockUser3, mockUser4, mockUser5 } from "@/__mocks__/data/users"
import { RoomState, SocketState, TableState } from "@/redux/features/socket-slice"

/**
 * Rooms Socket Data
 */

export const mockRoom1Info: ITowersRoom = {
  ...mockRoom1
}

export const mockRoom1Chat: ITowersRoomChatMessage[] = [
  {
    id: "",
    roomId: mockRoom1.id,
    userId: mockRoom1Table1ChatUser1.id,
    message: "Hey!",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser1
  },
  {
    id: "",
    roomId: mockRoom1.id,
    userId: mockRoom1Table1ChatUser2.id,
    message: "Wazzup?",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser2
  }
]

export const mockRoom1Users: ITowersUserProfile[] = [
  {
    ...mockRoom1Table1TowersUserProfile1,
    user: mockUser1,
    room: mockRoom1,
    table: mockRoom1Table1
  },
  {
    ...mockRoom1Table1TowersUserProfile2,
    user: mockUser2,
    room: mockRoom1,
    table: mockRoom1Table1
  },
  {
    ...mockRoom1Table1TowersUserProfile3,
    user: mockUser3,
    room: mockRoom1,
    table: mockRoom1Table1
  },
  {
    ...mockRoom1Table1TowersUserProfile4,
    user: mockUser4,
    room: mockRoom1,
    table: mockRoom1Table2
  },
  {
    ...mockRoom1Table1TowersUserProfile5,
    user: mockUser5,
    room: mockRoom1,
    table: mockRoom1Table3
  }
]

/**
 * Tables Socket Data
 */

export const mockRoom1Table1Info: ITowersTable = {
  ...mockRoom1Table1,
  room: mockRoom1,
  host: {
    ...mockUser1,
    towersUserProfile: mockRoom1Table1TowersUserProfile1
  },
  userProfiles: [
    {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1
    },
    {
      ...mockRoom1Table1TowersUserProfile2,
      user: mockUser2
    },
    {
      ...mockRoom1Table1TowersUserProfile3,
      user: mockUser3
    }
  ]
}

export const mockRoom1Table1Chat: ITowersTableChatMessage[] = [
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser1.id,
    message: `*** ${mockRoom1Table1ChatUser1.username} joined the table.`,
    type: TableChatMessageType.USER_ACTION,
    privateToUserId: mockRoom1Table1ChatUser1.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser1
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser2.id,
    message: `*** ${mockRoom1Table1ChatUser2.username}’s old rating: 1100; new rating: 1110`,
    type: TableChatMessageType.CHAT,
    privateToUserId: mockRoom1Table1ChatUser2.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser2
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser2.id,
    message: "Hey!",
    type: TableChatMessageType.CHAT,
    privateToUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser2
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser2.id,
    message: "Wazzup?",
    type: TableChatMessageType.CHAT,
    privateToUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser2
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser1.id,
    message: `*** ${mockRoom1Table1ChatUser1.username}’s old rating: 2050; new rating: 2040`,
    type: TableChatMessageType.SCORE_UPDATE,
    privateToUserId: mockRoom1Table1ChatUser1.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser1
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser1.id,
    message:
      "*** You are the host of the table. This gives you the power to invite to [or boot people from] your table. You may also limit other player’s access to your table by selecting its \"Table Type\".",
    type: TableChatMessageType.TABLE_HOST_UPDATE,
    privateToUserId: mockRoom1Table1ChatUser1.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser1
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser1.id,
    message: "*** Only people you have invited may play now.",
    type: TableChatMessageType.TABLE_TYPE_UPDATE,
    privateToUserId: mockRoom1Table1ChatUser1.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser1
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser1.id,
    message: "*** V ==> M",
    type: TableChatMessageType.CIPHER_KEY,
    privateToUserId: mockRoom1Table1ChatUser1.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser1
  },
  {
    id: "",
    tableId: mockRoom1Table1.id,
    userId: mockRoom1Table1ChatUser1.id,
    message: "2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE",
    type: TableChatMessageType.HERO_TEXT,
    privateToUserId: mockRoom1Table1ChatUser1.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockRoom1Table1ChatUser1
  }
]

export const mockRoom1Table1Users: ITowersUserProfile[] = [
  {
    ...mockRoom1Table1TowersUserProfile1,
    user: mockUser1,
    room: mockRoom1,
    table: mockRoom1Table1
  },
  {
    ...mockRoom1Table1TowersUserProfile1,
    user: mockUser2,
    room: mockRoom1,
    table: mockRoom1Table1
  },
  {
    ...mockRoom1Table1TowersUserProfile3,
    user: mockUser3,
    room: mockRoom1,
    table: mockRoom1Table1
  }
]

/**
 * Socket State
 */

export const mockSocketRoom1Id: string = mockRoom1.id
export const mockSocketRoom2Id: string = mockRoom2.id
export const mockSocketRoom3Id: string = mockRoom3.id

export const mockSocketStateRooms: Record<string, RoomState> = {
  [mockSocketRoom1Id]: {
    roomInfo: mockRoom1Info,
    isRoomInfoLoading: false,
    roomTables: [],
    isRoomTablesLoading: false,
    chat: mockRoom1Chat,
    isChatLoading: false,
    users: mockRoom1Users,
    isUsersLoading: false
  }
  // [mockSocketRoom2Id]: {},
  // [mockSocketRoom3Id]: {},
}

export const mockSocketRoom1Table1Id: string = mockRoom1Table1.id
export const mockSocketRoom1Table2Id: string = mockRoom1Table2.id
export const mockSocketRoom1Table3Id: string = mockRoom1Table3.id

export const mockSocketStateTables: Record<string, TableState> = {
  [mockSocketRoom1Table1Id]: {
    tableInfo: mockRoom1Table1Info,
    isTableInfoLoading: false,
    chat: mockRoom1Table1Chat,
    isChatLoading: false,
    users: mockRoom1Users,
    isUsersLoading: false
  }
  // [mockSocketRoom1Table2Id]: {},
  // [mockSocketRoom1Table3Id]: {},
}

export const mockSocketInitialState: SocketState = {
  isLoading: false,
  isConnected: false,
  rooms: {},
  tables: {},
  errorMessage: undefined
}
