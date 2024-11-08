import {
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  ITowersTableWithRelations,
  ITowersUserRoomTable,
  TableChatMessageType,
} from "@prisma/client"
import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Session } from "next-auth"
import { SocketState } from "@/interfaces/socket"
import { socketExtraReducers } from "@/redux/features/socket-extra-reducers"

const initialState: SocketState = {
  isConnected: false,
  isLoading: false,
  towers: {},
  errorMessage: null,
}

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    // **************************************************
    // * Socket IO Actions
    // **************************************************

    initSocket: (state: SocketState, action: PayloadAction<{ session: Session | null }>): void => {
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

    joinRoomSocketRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; towersUserRoomTable: ITowersUserRoomTable }>,
    ): void => {},
    leaveRoomSocketRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tablesToQuit: { id: string; isLastUser: boolean }[] }>,
    ): void => {},

    sendRoomChatMessage: (state: SocketState, action: PayloadAction<{ roomId: string; message: string }>): void => {},
    addMessageToRoomChat: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; message: ITowersRoomChatMessage }>,
    ): void => {
      const { roomId, message } = action.payload

      if (state.towers[roomId]?.chat) {
        state.towers[roomId].chat.push(message)
      }
    },

    addUserToRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; towersUserRoomTable: ITowersUserRoomTable }>,
    ): void => {
      const { roomId, towersUserRoomTable } = action.payload

      if (state.towers[roomId]?.users) {
        const roomUserIndex: number = state.towers[roomId].users.findIndex(
          (user: ITowersUserRoomTable) => user.userProfileId === towersUserRoomTable.userProfileId,
        )

        if (roomUserIndex !== -1) {
          state.towers[roomId].users[roomUserIndex] = towersUserRoomTable
        } else {
          state.towers[roomId].users.push(towersUserRoomTable)
        }
      }
    },
    updateUsers: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; users: ITowersUserRoomTable[] }>,
    ): void => {},
    updateUsersInRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; users: ITowersUserRoomTable[] }>,
    ): void => {
      const { roomId, users } = action.payload

      if (state.towers[roomId]) {
        state.towers[roomId].users = [...(state.towers[roomId].users ?? []), ...(users ?? [])]
          .sort(
            (a: ITowersUserRoomTable, b: ITowersUserRoomTable) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .filter(
            (user: ITowersUserRoomTable, index: number, users: ITowersUserRoomTable[]) =>
              index === users.findIndex((u: ITowersUserRoomTable) => u?.userProfileId === user?.userProfileId),
          )
      }
    },
    removeUserFromRoom: (state: SocketState, action: PayloadAction<{ roomId: string; userId: string }>): void => {
      const { roomId, userId } = action.payload

      if (state.towers[roomId]?.users) {
        state.towers[roomId].users = state.towers[roomId].users.filter(
          (towersUserRoomTable: ITowersUserRoomTable) => towersUserRoomTable.userProfile?.userId !== userId,
        )
      }
    },

    roomErrorMessage: (state: SocketState, action: PayloadAction<{ roomId: string; message: string }>): void => {
      const { roomId, message } = action.payload
      state.towers[roomId].errorMessage = message
    },

    // **************************************************
    // * Table Actions
    // **************************************************

    joinTableSocketRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; towersUserRoomTable: ITowersUserRoomTable }>,
    ): void => {},
    leaveTableSocketRoom: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {},

    addTable: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; info: ITowersTableWithRelations }>,
    ): void => {},
    addTableToRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; info: ITowersTableWithRelations }>,
    ): void => {
      const { roomId, info } = action.payload

      if (state.towers[roomId]?.tables) {
        state.towers[roomId].tables = {
          ...state.towers[roomId].tables,
          [info.id]: {
            ...state.towers[roomId].tables[info.id],
            info,
          },
        }
      }
    },
    updateTable: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; info?: ITowersTable; users?: ITowersUserRoomTable[] }>,
    ): void => {},
    updateTableInRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; info?: ITowersTable; users?: ITowersUserRoomTable[] }>,
    ): void => {
      const { roomId, tableId, info, users } = action.payload

      if (state.towers[roomId]) {
        state.towers[roomId].users = [...(state.towers[roomId].users ?? []), ...(users ?? [])]
          .sort(
            (a: ITowersUserRoomTable, b: ITowersUserRoomTable) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .filter(
            (user: ITowersUserRoomTable, index: number, users: ITowersUserRoomTable[]) =>
              index === users.findIndex((u: ITowersUserRoomTable) => u?.userProfileId === user?.userProfileId),
          )
      }

      if (state.towers[roomId].tables[tableId]) {
        state.towers[roomId].tables[tableId].info = {
          ...((state.towers[roomId].tables[tableId].info ?? {}) as ITowersTable),
          ...(info ?? {}),
        }

        state.towers[roomId].tables[tableId].users = [
          ...(state.towers[roomId].tables[tableId].users ?? []),
          ...(users ?? []),
        ]
          .sort(
            (a: ITowersUserRoomTable, b: ITowersUserRoomTable) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .filter(
            (user: ITowersUserRoomTable, index: number, users: ITowersUserRoomTable[]) =>
              index === users.findIndex((u: ITowersUserRoomTable) => u?.userProfileId === user?.userProfileId),
          )
      }
    },
    removeTable: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {},
    removeTableFromRoom: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {
      const { roomId, tableId } = action.payload

      if (state.towers[roomId].tables[tableId]) {
        delete state.towers[roomId].tables[tableId]
      }
    },

    sendTableChatMessage: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; message: string }>,
    ): void => {},
    addMessageToTableChat: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; message: ITowersTableChatMessage }>,
    ): void => {
      const { roomId, tableId, message } = action.payload

      if (state.towers[roomId].tables[tableId]?.chat) {
        state.towers[roomId].tables[tableId].chat.push(message)
      }
    },
    sendTableAutomatedChatMessage: (
      state: SocketState,
      action: PayloadAction<{
        roomId: string
        tableId: string
        message: string
        type: TableChatMessageType
        privateToUserId?: string
      }>,
    ): void => {},

    addUserToTable: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; towersUserRoomTable: ITowersUserRoomTable }>,
    ): void => {
      const { roomId, tableId, towersUserRoomTable } = action.payload

      if (state.towers[roomId].tables[tableId]?.users) {
        const tableUserIndex: number = state.towers[roomId].tables[tableId].users.findIndex(
          (user: ITowersUserRoomTable) => user.userProfileId === towersUserRoomTable.userProfileId,
        )

        if (tableUserIndex !== -1) {
          state.towers[roomId].tables[tableId].users[tableUserIndex] = towersUserRoomTable
        } else {
          state.towers[roomId].tables[tableId].users.push(towersUserRoomTable)
        }
      }
    },
    removeUserFromTable: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; userId: string }>,
    ): void => {
      const { roomId, tableId, userId } = action.payload

      if (state.towers[roomId].tables[tableId]?.users) {
        state.towers[roomId].tables[tableId].users = state.towers[roomId].tables[tableId].users.filter(
          (towersUserRoomTable: ITowersUserRoomTable) => towersUserRoomTable.userProfile?.userId !== userId,
        )
      }
    },

    tableErrorMessage: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; message: string }>,
    ): void => {
      const { roomId, tableId, message } = action.payload
      state.towers[roomId].tables[tableId].errorMessage = message
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
  joinRoomSocketRoom,
  leaveRoomSocketRoom,
  sendRoomChatMessage,
  addMessageToRoomChat,
  addUserToRoom,
  updateUsers,
  updateUsersInRoom,
  removeUserFromRoom,
  roomErrorMessage,
  joinTableSocketRoom,
  leaveTableSocketRoom,
  addTable,
  addTableToRoom,
  updateTable,
  updateTableInRoom,
  removeTable,
  removeTableFromRoom,
  sendTableChatMessage,
  addMessageToTableChat,
  sendTableAutomatedChatMessage,
  addUserToTable,
  removeUserFromTable,
  tableErrorMessage,
} = socketSlice.actions

export default socketSlice.reducer
