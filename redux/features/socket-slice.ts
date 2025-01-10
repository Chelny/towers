import {
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  TableChatMessageType,
  TowersUserTable,
} from "@prisma/client"
import { ITowersUserProfile } from "@prisma/client"
import { JsonObject } from "@prisma/client/runtime/library"
import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SocketState } from "@/interfaces/socket"
import { Session } from "@/lib/auth-client"
import { socketExtraReducers } from "@/redux/features/socket-extra-reducers"

const initialState: SocketState = {
  isConnected: false,
  isLoading: false,
  towers: {
    rooms: {},
    tables: {},
  },
  errorMessage: null,
}

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    // **************************************************
    // * Socket IO Actions
    // **************************************************

    initSocket: (state: SocketState, action: PayloadAction<{ session: Session }>): void => {
      state.isConnected = false
      state.isLoading = true
      state.errorMessage = null
    },
    destroySocket: (state: SocketState): void => {
      state.isConnected = false
      state.isLoading = false
      state.errorMessage = null
    },
    connectionEstablished: (state: SocketState): void => {
      state.isConnected = true
      state.isLoading = false
      state.errorMessage = null
    },
    connectionLost: (state: SocketState, action: PayloadAction<string>): void => {
      state.isConnected = false
      state.isLoading = false
      state.errorMessage = action.payload
    },

    // **************************************************
    // * Server.js Error Actions
    // **************************************************

    serverError: (state: SocketState, action: PayloadAction<string>): void => {
      state.isLoading = false
      state.errorMessage = action.payload
    },

    // **************************************************
    // * Room Actions
    // **************************************************

    joinRoom: (state: SocketState, action: PayloadAction<{ roomId: string }>): void => {},
    joinRoomSuccess: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; towersUserProfile: ITowersUserProfile }>,
    ): void => {
      const { roomId, towersUserProfile } = action.payload

      if (!state.towers.rooms[roomId]) {
        state.towers.rooms[roomId] = {
          info: null,
          isInfoLoading: false,
          chat: [],
          isChatLoading: false,
          users: [],
          isUsersLoading: false,
          tables: {},
          isTablesLoading: false,
          errorMessage: null,
        }
      }

      if (!state.towers.rooms[roomId].users || state.towers.rooms[roomId].users?.length === 0) {
        state.towers.rooms[roomId].users = [towersUserProfile]
      } else {
        const roomUserIndex: number = state.towers.rooms[roomId].users.findIndex(
          (userProfile: ITowersUserProfile) => userProfile.id === towersUserProfile.id,
        )

        if (roomUserIndex !== -1) {
          state.towers.rooms[roomId].users[roomUserIndex] = towersUserProfile
        } else {
          state.towers.rooms[roomId].users.push(towersUserProfile)
        }
      }
    },

    leaveRoom: (state: SocketState, action: PayloadAction<{ roomId: string }>): void => {},
    leaveRoomSuccess: (state: SocketState, action: PayloadAction<{ roomId: string; userId: string }>): void => {
      const { roomId, userId } = action.payload

      if (!state.towers.rooms[roomId]) return

      if (state.towers.rooms[roomId].users) {
        state.towers.rooms[roomId].users = state.towers.rooms[roomId].users.filter(
          (towersUserProfile: ITowersUserProfile) => towersUserProfile.userId !== userId,
        )
      }
    },
    removeRoomSelf: (state: SocketState, action: PayloadAction<{ roomId: string }>): void => {
      const { roomId } = action.payload

      if (state.towers.rooms[roomId]) {
        delete state.towers.rooms[roomId]
      }
    },

    updateRoomUser: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; towersUserProfile: ITowersUserProfile }>,
    ): void => {
      const { roomId, towersUserProfile } = action.payload

      if (!state.towers.rooms[roomId]) return

      if (state.towers.rooms[roomId].users) {
        const towersUserProfileIndex: number = state.towers.rooms[roomId].users.findIndex(
          (userProfile: ITowersUserProfile) => userProfile.id !== towersUserProfile.id,
        )

        if (towersUserProfileIndex !== -1) {
          state.towers.rooms[roomId].users[towersUserProfileIndex] = towersUserProfile
        }
      }
    },

    addChatMessageToRoom: (state: SocketState, action: PayloadAction<{ roomId: string; message: string }>): void => {},
    addChatMessageToRoomSuccess: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; chatMessage: ITowersRoomChatMessage }>,
    ): void => {
      const { roomId, chatMessage } = action.payload

      if (!state.towers.rooms[roomId]) return

      if (!state.towers.rooms[roomId]?.chat) {
        state.towers.rooms[roomId].chat = [chatMessage]
      } else {
        const chatMessages: ITowersRoomChatMessage[] = state.towers.rooms[roomId].chat

        if (chatMessages) {
          const isDuplicate: boolean = chatMessages.some(
            (message: ITowersRoomChatMessage) => message.id === chatMessage.id,
          )
          if (!isDuplicate) chatMessages.push(chatMessage)
        }
      }
    },

    addTableToRoom: (state: SocketState, action: PayloadAction<{ roomId: string; table: ITowersTable }>): void => {},
    addTableToRoomSuccess: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; table: ITowersTable }>,
    ): void => {
      const { roomId, table } = action.payload

      if (!state.towers.rooms[roomId]) return

      if (!state.towers.rooms[roomId].tables) {
        state.towers.rooms[roomId].tables = {
          [table.id]: { info: table, users: [] },
        }
      } else {
        state.towers.rooms[roomId].tables = {
          ...state.towers.rooms[roomId].tables,
          [table.id]: {
            ...state.towers.rooms[roomId].tables[table.id],
            info: table,
          },
        }
      }
    },
    updateRoomTable: (
      state: SocketState,
      action: PayloadAction<{
        roomId: string
        tableId: string
        table?: ITowersTable
        towersUserProfiles?: ITowersUserProfile[]
      }>,
    ): void => {},
    updateRoomTableSuccess: (
      state: SocketState,
      action: PayloadAction<{
        roomId: string
        tableId: string
        table?: ITowersTable
        towersUserProfiles?: ITowersUserProfile[]
      }>,
    ): void => {
      const { roomId, tableId, table, towersUserProfiles } = action.payload

      if (!state.towers.rooms[roomId]) return

      if (!state.towers.rooms[roomId]?.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          info: table ?? null,
          users: towersUserProfiles ?? [],
        }
      } else {
        if (table) {
          state.towers.tables[tableId].info = {
            ...state.towers.tables[tableId].info,
            ...table,
          }
        }

        if (towersUserProfiles) {
          state.towers.rooms[roomId].tables[tableId].users = [
            ...state.towers.rooms[roomId].tables[tableId].users,
            ...towersUserProfiles,
          ]
            .sort(
              (a: ITowersUserProfile, b: ITowersUserProfile) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            )
            .filter(
              (user: ITowersUserProfile, index: number, users: ITowersUserProfile[]) =>
                users.findIndex((u: ITowersUserProfile) => u.id === user.id) === index,
            )
        }
      }
    },
    removeTableFromRoom: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {},
    removeTableFromRoomSuccess: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string }>,
    ): void => {
      const { roomId, tableId } = action.payload

      if (!state.towers.rooms[roomId]) return

      if (state.towers.rooms[roomId].tables[tableId]) {
        delete state.towers.rooms[roomId].tables[tableId]
      }
    },

    roomErrorMessage: (state: SocketState, action: PayloadAction<{ roomId: string; message: string }>): void => {
      const { roomId, message } = action.payload
      state.towers.rooms[roomId].errorMessage = message
    },

    // **************************************************
    // * Table Actions
    // **************************************************

    joinTable: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {},
    joinTableSuccess: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; towersUserProfile: ITowersUserProfile }>,
    ): void => {
      const { roomId, tableId, towersUserProfile } = action.payload

      if (!state.towers.rooms[roomId]) {
        state.towers.rooms[roomId] = {
          info: null,
          isInfoLoading: false,
          chat: [],
          isChatLoading: false,
          users: [],
          isUsersLoading: false,
          tables: {},
          isTablesLoading: false,
          errorMessage: null,
        }
      }

      // Add user in room users list
      if (!state.towers.rooms[roomId].users) {
        state.towers.rooms[roomId].users = [towersUserProfile]
      } else {
        const roomUserIndex = state.towers.rooms[roomId].users.findIndex(
          (userProfile: ITowersUserProfile) => userProfile.id === towersUserProfile.id,
        )

        if (roomUserIndex !== -1) {
          state.towers.rooms[roomId].users[roomUserIndex] = towersUserProfile
        } else {
          state.towers.rooms[roomId].users.push(towersUserProfile)
        }
      }

      if (!state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          info: null,
          isInfoLoading: false,
          chat: [],
          isChatLoading: false,
          users: [],
          isUsersLoading: false,
          errorMessage: null,
        }
      }

      // Add user in table users list
      if (!state.towers.tables[tableId].users) {
        state.towers.tables[tableId].users = [towersUserProfile]
      } else {
        const tableUserIndex: number = state.towers.tables[tableId].users.findIndex(
          (userProfile: ITowersUserProfile) => userProfile.id === towersUserProfile.id,
        )

        if (tableUserIndex !== -1) {
          state.towers.tables[tableId].users[tableUserIndex] = towersUserProfile
        } else {
          state.towers.tables[tableId].users.push(towersUserProfile)
        }
      }
    },

    leaveTable: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {},
    leaveTableSuccess: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; userId: string }>,
    ): void => {
      const { roomId, tableId, userId } = action.payload

      // Remove user in room users list
      if (state.towers.rooms[roomId].users) {
        state.towers.rooms[roomId].users = state.towers.rooms[roomId].users.map(
          (towersUserProfile: ITowersUserProfile) => {
            if (towersUserProfile.userId === userId) {
              return {
                ...towersUserProfile,
                userTables: towersUserProfile.userTables?.filter(
                  (userTable: TowersUserTable) => userTable.tableId !== tableId,
                ),
              }
            }
            return towersUserProfile
          },
        )
      }

      // Remove user in table users list
      if (state.towers.tables[tableId].users) {
        state.towers.tables[tableId].users = state.towers.tables[tableId].users.filter(
          (towersUserProfile: ITowersUserProfile) => towersUserProfile.userId !== userId,
        )
      }
    },
    removeTableSelf: (state: SocketState, action: PayloadAction<{ tableId: string }>): void => {
      const { tableId } = action.payload

      if (state.towers.tables[tableId]) {
        delete state.towers.tables[tableId]
      }
    },

    updateTableUser: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; towersUserProfile: ITowersUserProfile }>,
    ): void => {
      const { roomId, tableId, towersUserProfile } = action.payload

      if (!state.towers.rooms[roomId]) return

      // Update user in room users list
      if (state.towers.rooms[roomId].users) {
        const roomUserIndex = state.towers.rooms[roomId].users.findIndex(
          (userProfile: ITowersUserProfile) => userProfile.id === towersUserProfile.id,
        )

        if (roomUserIndex !== -1) {
          state.towers.rooms[roomId].users[roomUserIndex] = towersUserProfile
        }
      }

      if (!state.towers.tables[tableId]) return

      // Update user in table users list
      if (state.towers.tables[tableId].users) {
        const towersUserProfileIndex: number = state.towers.tables[tableId].users.findIndex(
          (userProfile: ITowersUserProfile) => userProfile.id === towersUserProfile.id,
        )

        if (towersUserProfileIndex !== -1) {
          state.towers.tables[tableId].users[towersUserProfileIndex] = towersUserProfile
        }
      }
    },

    addChatMessageToTable: (
      state: SocketState,
      action: PayloadAction<{
        roomId: string
        tableId: string
        message?: string
        messageVariables?: JsonObject
        type?: TableChatMessageType
      }>,
    ): void => {},
    addChatMessageToTableSuccess: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; chatMessage: ITowersTableChatMessage }>,
    ): void => {
      const { roomId, tableId, chatMessage } = action.payload

      if (!state.towers.rooms[roomId]) return

      if (!state.towers.tables[tableId]?.chat) {
        state.towers.tables[tableId].chat = []
      } else {
        const chatMessages: ITowersTableChatMessage[] = state.towers.tables[tableId].chat

        if (chatMessages) {
          const isDuplicate: boolean = chatMessages.some(
            (message: ITowersTableChatMessage) => message.id === chatMessage.id,
          )
          if (!isDuplicate) chatMessages.push(chatMessage)
        }
      }
    },

    tableErrorMessage: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; message: string }>,
    ): void => {
      const { roomId, tableId, message } = action.payload
      state.towers.tables[tableId].errorMessage = message
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SocketState>): void => {
    socketExtraReducers(builder)
  },
})

export const {
  initSocket,
  destroySocket,
  connectionEstablished,
  connectionLost,
  serverError,
  joinRoom,
  leaveRoom,
  removeRoomSelf,
  addChatMessageToRoom,
  addChatMessageToRoomSuccess,
  joinRoomSuccess,
  updateRoomUser,
  leaveRoomSuccess,
  removeTableSelf,
  roomErrorMessage,
  joinTable,
  leaveTable,
  addTableToRoom,
  addTableToRoomSuccess,
  updateRoomTable,
  updateRoomTableSuccess,
  removeTableFromRoom,
  removeTableFromRoomSuccess,
  addChatMessageToTable,
  addChatMessageToTableSuccess,
  joinTableSuccess,
  leaveTableSuccess,
  tableErrorMessage,
} = socketSlice.actions

export default socketSlice.reducer
