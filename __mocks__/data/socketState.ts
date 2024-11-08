import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  ITowersUserRoomTable,
} from "@prisma/client"
import { mockRoom1, mockRoom2, mockRoom3 } from "@/__mocks__/data/rooms"
import { mockRoom1Table1, mockRoom1Table2, mockRoom1Table3 } from "@/__mocks__/data/tables"
import {
  mockRoom1TowersRoomChatMessage1,
  mockRoom1TowersRoomChatMessage2,
} from "@/__mocks__/data/towersRoomChatMessages"
import {
  mockRoom1Table1TowersChatMessage1,
  mockRoom1Table1TowersChatMessage2,
  mockRoom1Table1TowersChatMessage3,
  mockRoom1Table1TowersChatMessage4,
  mockRoom1Table1TowersChatMessage5,
  mockRoom1Table1TowersChatMessage6,
  mockRoom1Table1TowersChatMessage7,
  mockRoom1Table1TowersChatMessage8,
  mockRoom1Table1TowersChatMessage9,
} from "@/__mocks__/data/towersTableChatMessages"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2,
  mockRoom1Table1TowersUserProfile3,
  mockRoom1Table1TowersUserProfile4,
  mockRoom1Table1TowersUserProfile5,
} from "@/__mocks__/data/towersUserProfiles"
import {
  mockRoom1Table1TowersUserRoomTable1,
  mockRoom1Table1TowersUserRoomTable2,
  mockRoom1Table1TowersUserRoomTable3,
  mockRoom1Table1TowersUserRoomTable4,
  mockRoom1Table1TowersUserRoomTable5,
} from "@/__mocks__/data/towersUserRoomTables"
import { mockUser1, mockUser2, mockUser3, mockUser4, mockUser5 } from "@/__mocks__/data/users"
import { SocketState } from "@/interfaces/socket"
import { SidebarState } from "@/redux/features/sidebar-slice"

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

const mockRoom1Users: ITowersUserRoomTable[] = [
  {
    ...mockRoom1Table1TowersUserRoomTable1,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
    table: mockRoom1Table1,
  },
  {
    ...mockRoom1Table1TowersUserRoomTable2,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile2,
      user: mockUser2,
    },
    table: mockRoom1Table1,
  },
  {
    ...mockRoom1Table1TowersUserRoomTable3,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile3,
      user: mockUser3,
    },
    table: mockRoom1Table1,
  },
  {
    ...mockRoom1Table1TowersUserRoomTable4,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile4,
      user: mockUser4,
    },
    table: mockRoom1Table2,
  },
  {
    ...mockRoom1Table1TowersUserRoomTable5,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile5,
      user: mockUser5,
    },
    table: mockRoom1Table3,
  },
]

/**
 * Tables Socket Data
 */

const mockRoom1Table1Info: ITowersTable = {
  ...mockRoom1Table1,
  host: {
    ...mockRoom1Table1TowersUserProfile1,
    user: mockUser1,
  },
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
]

const mockRoom1Table1Users: ITowersUserRoomTable[] = [
  {
    ...mockRoom1Table1TowersUserRoomTable1,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile1,
      user: mockUser1,
    },
    table: mockRoom1Table1,
  },
  {
    ...mockRoom1Table1TowersUserRoomTable2,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile2,
      user: mockUser2,
    },
    table: mockRoom1Table1,
  },
  {
    ...mockRoom1Table1TowersUserRoomTable3,
    userProfile: {
      ...mockRoom1Table1TowersUserProfile3,
      user: mockUser3,
    },
    table: mockRoom1Table1,
  },
]

/**
 * Socket State
 */

export const mockSocketInitialState: SocketState = {
  isConnected: false,
  isLoading: false,
  towers: {},
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
    [mockSocketRoom1Id]: {
      isJoined: false,
      info: mockRoom1Info,
      isInfoLoading: false,
      chat: mockRoom1Chat,
      isChatLoading: false,
      users: mockRoom1Users,
      isUsersLoading: false,
      tables: {
        [mockSocketRoom1Table1Id]: {
          isJoined: false,
          info: mockRoom1Table1Info,
          isInfoLoading: false,
          chat: mockRoom1Table1Chat,
          isChatLoading: false,
          users: mockRoom1Table1Users,
          isUsersLoading: false,
          errorMessage: null,
        },
        // [mockSocketRoom1Table2Id]: {},
        // [mockSocketRoom1Table3Id]: {},
      },
      isTablesLoading: false,
      errorMessage: null,
    },
  },
  errorMessage: null,
}

export const mockTowers = mockSocketState.towers

export const mockTowersRoomState1 = mockSocketState.towers[mockSocketRoom1Id]
export const mockTowersRoomState1IsJoined = mockSocketState.towers[mockSocketRoom1Id].isJoined
export const mockTowersRoomState1Info = mockSocketState.towers[mockSocketRoom1Id].info
export const mockTowersRoomState1Chat = mockSocketState.towers[mockSocketRoom1Id].chat
export const mockTowersRoomState1Users = mockSocketState.towers[mockSocketRoom1Id].users
export const mockTowersRoomState1Tables = mockSocketState.towers[mockSocketRoom1Id].tables

export const mockTowersTableState11 = mockSocketState.towers[mockSocketRoom1Id].tables[mockSocketRoom1Table1Id]
export const mockTowersTableState11IsJoined =
  mockSocketState.towers[mockSocketRoom1Id].tables[mockSocketRoom1Table1Id].isJoined
export const mockTowersTableState11Info = mockSocketState.towers[mockSocketRoom1Id].tables[mockSocketRoom1Table1Id].info
export const mockTowersTableState11Chat = mockSocketState.towers[mockSocketRoom1Id].tables[mockSocketRoom1Table1Id].chat
export const mockTowersTableState11Users =
  mockSocketState.towers[mockSocketRoom1Id].tables[mockSocketRoom1Table1Id].users

/**
 * Redux States
 */

export const mockStoreReducers = {
  socket: mockSocketInitialState,
  sidebar: {} as SidebarState,
}
