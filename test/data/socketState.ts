import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  ITowersUserProfile,
} from "@prisma/client"
import { SocketState, TowersRoomState, TowersRoomTableState, TowersState, TowersTableState } from "@/interfaces/socket"
import { SidebarState } from "@/redux/features/sidebar-slice"
import { mockRoom1, mockRoom2, mockRoom3 } from "@/test/data/rooms"
import { mockRoom1Table1, mockRoom1Table2, mockRoom1Table3 } from "@/test/data/tables"
import { mockRoom1TowersRoomChatMessage1, mockRoom1TowersRoomChatMessage2 } from "@/test/data/towersRoomChatMessages"
import {
  mockRoom1Table1TowersChatMessage1,
  mockRoom1Table1TowersChatMessage10,
  mockRoom1Table1TowersChatMessage2,
  mockRoom1Table1TowersChatMessage3,
  mockRoom1Table1TowersChatMessage4,
  mockRoom1Table1TowersChatMessage5,
  mockRoom1Table1TowersChatMessage6,
  mockRoom1Table1TowersChatMessage7,
  mockRoom1Table1TowersChatMessage8,
  mockRoom1Table1TowersChatMessage9,
} from "@/test/data/towersTableChatMessages"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2,
  mockRoom1Table1TowersUserProfile3,
  mockRoom1Table1TowersUserProfile4,
  mockRoom1Table1TowersUserProfile5,
} from "@/test/data/towersUserProfiles"
import {
  mockRoom1Table1TowersUserTable1,
  mockRoom1Table1TowersUserTable2,
  mockRoom1Table1TowersUserTable3,
  mockRoom1Table1TowersUserTable4,
  mockRoom1Table1TowersUserTable5,
} from "@/test/data/towersUserTables"
import { mockUser1, mockUser2, mockUser3, mockUser4, mockUser5 } from "@/test/data/users"

/**
 * Rooms Socket Data
 */

const mockRoom1Info: ITowersRoom = mockRoom1

const mockRoom1Chat: ITowersRoomChatMessage[] = [
  {
    ...mockRoom1TowersRoomChatMessage1,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1TowersRoomChatMessage2,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile2,
      user: mockUser2,
    },
  },
]

const mockRoom1Users: ITowersUserProfile[] = [
  {
    ...mockRoom1Table1TowersUserProfile1,
    user: mockUser1,
    // userTables: [
    //   {
    //     ...mockRoom1Table1TowersUserTable1,
    //     userProfile: {
    //       ...mockRoom1Table1TowersUserProfile1,
    //       user: mockUser1,
    //     },
    //     table:
    //   },
    // ],
  },
  {
    ...mockRoom1Table1TowersUserProfile2,
    user: mockUser2,
    // userTables: [mockRoom1Table1TowersUserTable2],
  },
  {
    ...mockRoom1Table1TowersUserProfile3,
    user: mockUser3,
    // userTables: [mockRoom1Table1TowersUserTable3],
  },
  {
    ...mockRoom1Table1TowersUserProfile4,
    user: mockUser4,
    // userTables: [mockRoom1Table1TowersUserTable4],
  },
  {
    ...mockRoom1Table1TowersUserProfile5,
    user: mockUser5,
    // userTables: [mockRoom1Table1TowersUserTable5],
  },
]

/**
 * Tables Socket Data
 */

const mockRoom1Table1Info: ITowersTable = {
  ...mockRoom1Table1,
  room: mockRoom1,
  host: {
    ...mockRoom1Table1TowersUserProfile1,
    user: mockUser1,
  },
  userTables: [
    {
      ...mockRoom1Table1TowersUserTable1,
      userProfile: {
        ...mockRoom1Table1TowersUserProfile1,
        user: mockUser1,
      },
      table: mockRoom1Table1,
    },
    {
      ...mockRoom1Table1TowersUserTable2,
      userProfile: {
        ...mockRoom1Table1TowersUserProfile2,
        user: mockUser2,
      },
      table: mockRoom1Table1,
    },
    {
      ...mockRoom1Table1TowersUserTable3,
      userProfile: {
        ...mockRoom1Table1TowersUserProfile3,
        user: mockUser3,
      },
      table: mockRoom1Table1,
    },
  ],
}

const mockRoom1Table1Chat: ITowersTableChatMessage[] = [
  {
    ...mockRoom1Table1TowersChatMessage1,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage2,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile2,
      user: mockUser2,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage3,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile2,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage4,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile2,
      user: mockUser2,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage5,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage6,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage7,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage8,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage9,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
  {
    ...mockRoom1Table1TowersChatMessage10,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
  },
]

const mockRoom1Table1Users: ITowersUserProfile[] = [
  {
    ...mockRoom1Table1TowersUserProfile1,
    user: mockUser1,
  },
  {
    ...mockRoom1Table1TowersUserProfile2,
    user: mockUser2,
  },
  {
    ...mockRoom1Table1TowersUserProfile3,
    user: mockUser3,
  },
]

/**
 * Socket State
 */

export const mockSocketInitialState: SocketState = {
  isConnected: false,
  isLoading: false,
  towers: {
    rooms: {},
    tables: {},
  },
  errorMessage: null,
}

export const mockSocketRoom1Id: string = mockRoom1.id
export const mockSocketRoom2Id: string = mockRoom2.id
export const mockSocketRoom3Id: string = mockRoom3.id

export const mockSocketRoom1Table1Id: string = mockRoom1Table1.id
export const mockSocketRoom1Table2Id: string = mockRoom1Table2.id
export const mockSocketRoom1Table3Id: string = mockRoom1Table3.id

export const mockSocketState: SocketState = {
  isConnected: true,
  isLoading: false,
  towers: {
    rooms: {
      [mockSocketRoom1Id]: {
        info: mockRoom1Info,
        isInfoLoading: false,
        chat: mockRoom1Chat,
        isChatLoading: false,
        users: mockRoom1Users,
        isUsersLoading: false,
        tables: {
          [mockSocketRoom1Table1Id]: {
            info: mockRoom1Table1Info,
            users: mockRoom1Table1Users,
          },
        },
        isTablesLoading: false,
        errorMessage: null,
      },
    },
    tables: {
      [mockSocketRoom1Table1Id]: {
        info: mockRoom1Table1Info,
        isInfoLoading: false,
        chat: mockRoom1Table1Chat,
        isChatLoading: false,
        users: mockRoom1Table1Users,
        isUsersLoading: false,
        errorMessage: null,
      },
    },
  },
  errorMessage: null,
}

export const mockTowers: TowersState = mockSocketState.towers

export const mockTowersRoomState1: TowersRoomState = mockSocketState.towers.rooms[mockSocketRoom1Id]
export const mockTowersRoomState1Info: ITowersRoom | null = mockSocketState.towers.rooms[mockSocketRoom1Id].info
export const mockTowersRoomState1Chat: ITowersRoomChatMessage[] = mockSocketState.towers.rooms[mockSocketRoom1Id].chat
export const mockTowersRoomState1Users: ITowersUserProfile[] = mockSocketState.towers.rooms[mockSocketRoom1Id].users
export const mockTowersRoomState1Tables: Record<string, TowersRoomTableState> =
  mockSocketState.towers.rooms[mockSocketRoom1Id].tables

export const mockTowersTableState11: TowersTableState = mockSocketState.towers.tables[mockSocketRoom1Table1Id]
export const mockTowersTableState11Info: ITowersTable | null =
  mockSocketState.towers.tables[mockSocketRoom1Table1Id].info
export const mockTowersTableState11Chat: ITowersTableChatMessage[] =
  mockSocketState.towers.tables[mockSocketRoom1Table1Id].chat
export const mockTowersTableState11Users: ITowersUserProfile[] =
  mockSocketState.towers.tables[mockSocketRoom1Table1Id].users

/**
 * Redux States
 */

export const mockStoreReducers = {
  socket: mockSocketInitialState,
  sidebar: {} as SidebarState,
}
