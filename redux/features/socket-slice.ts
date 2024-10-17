import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  ITowersUserProfile,
} from "@prisma/client"
import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  fetchRoomChat,
  fetchRoomInfo,
  fetchRoomTables,
  fetchRoomUsers,
  joinRoom,
  leaveRoom,
} from "@/redux/thunks/room-thunks"
import { fetchTableChat, fetchTableInfo, fetchTableUsers, joinTable, leaveTable } from "@/redux/thunks/table-thunks"

export interface RoomState {
  roomInfo: ITowersRoom | null
  isRoomInfoLoading: boolean
  roomTables: ITowersTable[]
  isRoomTablesLoading: boolean
  chat: ITowersRoomChatMessage[]
  isChatLoading: boolean
  users: ITowersUserProfile[]
  isUsersLoading: boolean
  errorMessage?: string
}

export interface TableState {
  tableInfo: ITowersTable | null
  isTableInfoLoading: boolean
  chat: ITowersTableChatMessage[]
  isChatLoading: boolean
  users: ITowersUserProfile[]
  isUsersLoading: boolean
  errorMessage?: string
}

export interface SocketState {
  isConnected: boolean
  isLoading: boolean
  rooms: Record<string, RoomState>
  tables: Record<string, TableState>
  errorMessage?: string
}

const initialState: SocketState = {
  isConnected: false,
  isLoading: false,
  rooms: {},
  tables: {},
  errorMessage: undefined,
}

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    // **************************************************
    // * Socket IO Actions
    // **************************************************

    initSocket: (state: SocketState): void => {
      state.isConnected = false
      state.errorMessage = undefined
    },
    destroySocket: (state: SocketState): void => {
      state.isConnected = false
      state.errorMessage = undefined
    },
    connectionEstablished: (state: SocketState): void => {
      state.isConnected = true
      state.errorMessage = undefined
    },
    connectionLost: (state: SocketState, action: PayloadAction<string | undefined>): void => {
      state.isConnected = false
      state.errorMessage = action.payload
    },

    // **************************************************
    // * Server.js Error Actions
    // **************************************************

    serverError: (state: SocketState, action: PayloadAction<string>): void => {
      state.errorMessage = action.payload
    },

    // **************************************************
    // * Room Actions
    // **************************************************

    joinRoomSocketRoom: (state: SocketState, action: PayloadAction<{ roomId: string }>): void => {},
    leaveRoomSocketRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tablesToQuit: { id: string; isLastUser: boolean }[] }>
    ): void => {},
    sendRoomChatMessage: (state: SocketState, action: PayloadAction<{ roomId: string; message: string }>): void => {},
    addMessageToRoomChat: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; message: ITowersRoomChatMessage }>
    ): void => {
      const { roomId, message } = action.payload

      state.rooms[roomId] = {
        ...state.rooms[roomId],
        chat: [...state.rooms[roomId]?.chat, message],
      }
    },
    addUserToRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; towersUserProfile: ITowersUserProfile }>
    ): void => {
      const { roomId, towersUserProfile } = action.payload

      state.rooms[roomId] = {
        ...state.rooms[roomId],
        users: [...state.rooms[roomId]?.users, towersUserProfile],
      }
    },
    removeUserFromRoom: (state: SocketState, action: PayloadAction<{ roomId: string; userId: string }>): void => {
      const { roomId, userId } = action.payload

      state.rooms[roomId].users = state.rooms[roomId].users.filter(
        (towersUserProfile: ITowersUserProfile) => towersUserProfile.userId !== userId
      )
    },
    roomErrorMessage: (state: SocketState, action: PayloadAction<{ roomId: string; message: string }>): void => {
      const { roomId, message } = action.payload

      state.rooms[roomId] = {
        ...state.rooms[roomId],
        errorMessage: message,
      }
    },

    // **************************************************
    // * Table Actions
    // **************************************************

    joinTableSocketRoom: (state: SocketState, action: PayloadAction<{ tableId: string }>): void => {},
    beforeLeaveTableSocketRoom: (
      state: SocketState,
      action: PayloadAction<{ tableId: string; isLastUser: boolean }>
    ): void => {},
    addTable: (state: SocketState, action: PayloadAction<{ roomId: string; table: ITowersTable }>): void => {},
    addTableToRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; userId: string; table: ITowersTable }>
    ): void => {
      const { roomId, userId, table } = action.payload

      state.rooms[roomId].roomTables.push(table)

      // Update user's table on users list
      const userIndex: number = state.rooms[roomId].users.findIndex(
        (user: ITowersUserProfile) => user.userId === userId
      )

      if (userIndex !== -1) {
        state.rooms[roomId].users[userIndex] = {
          ...state.rooms[roomId].users[userIndex],
          table,
        }
      }
    },
    updateTable: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; table: ITowersTable }>
    ): void => {},
    updateTableInRoom: (
      state: SocketState,
      action: PayloadAction<{ roomId: string; tableId: string; table: ITowersTable }>
    ): void => {
      const { roomId, tableId, table } = action.payload

      // Update room table
      const tableIndex: number = state.rooms[roomId].roomTables.findIndex(
        (roomTable: ITowersTable) => roomTable.id === tableId
      )

      if (tableIndex !== -1) {
        state.rooms[roomId].roomTables[tableIndex] = {
          ...state.rooms[roomId].roomTables[tableIndex],
          ...table,
        }
      }

      // Update table
      if (state.tables[tableId]?.tableInfo) {
        state.tables[tableId].tableInfo = {
          ...state.tables[tableId].tableInfo,
          ...table,
        }
      }
    },
    removeTable: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {},
    removeTableFromRoom: (state: SocketState, action: PayloadAction<{ roomId: string; tableId: string }>): void => {
      const { roomId, tableId } = action.payload

      state.rooms[roomId].roomTables = state.rooms[roomId].roomTables.filter(
        (table: ITowersTable) => table.id !== tableId
      )
    },
    sendTableChatMessage: (state: SocketState, action: PayloadAction<{ tableId: string; message: string }>): void => {},
    addMessageToTableChat: (
      state: SocketState,
      action: PayloadAction<{ tableId: string; message: ITowersTableChatMessage }>
    ): void => {
      const { tableId, message } = action.payload

      state.tables[tableId] = {
        ...state.tables[tableId],
        chat: [...state.tables[tableId]?.chat, message],
      }
    },
    sendTableAutomatedChatMessage: (
      state: SocketState,
      action: PayloadAction<{ tableId: string; userId: string; message: string; type: string }>
    ): void => {},
    addUserToTable: (
      state: SocketState,
      action: PayloadAction<{ tableId: string; towersUserProfile: ITowersUserProfile }>
    ): void => {
      const { tableId, towersUserProfile } = action.payload

      state.tables[tableId] = {
        ...state.tables[tableId],
        users: [...state.tables[tableId]?.users, towersUserProfile],
      }
    },
    removeUserFromTable: (state: SocketState, action: PayloadAction<{ tableId: string; userId: string }>): void => {
      const { tableId, userId } = action.payload

      state.tables[tableId].users = state.tables[tableId].users.filter(
        (user: ITowersUserProfile) => user.userId !== userId
      )
    },
    tableErrorMessage: (state: SocketState, action: PayloadAction<{ tableId: string; message: string }>): void => {
      const { tableId, message } = action.payload

      state.tables[tableId] = {
        ...state.tables[tableId],
        errorMessage: message,
      }
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SocketState>): void => {
    builder
      // **************************************************
      // * Join Room
      // **************************************************

      .addCase(joinRoom.pending, (state: SocketState): void => {
        state.isLoading = true
        state.errorMessage = undefined
      })
      .addCase(joinRoom.fulfilled, (state: SocketState, action): void => {
        const { roomId } = action.payload

        state.isLoading = false
        state.rooms[roomId] = {
          roomInfo: null,
          isRoomInfoLoading: false,
          roomTables: [],
          isRoomTablesLoading: false,
          chat: [],
          isChatLoading: false,
          users: [],
          isUsersLoading: false,
          errorMessage: undefined,
        }
      })
      .addCase(joinRoom.rejected, (state: SocketState, action): void => {
        state.isLoading = false
        state.errorMessage = action.payload
      })

      // **************************************************
      // * Leave Room
      // **************************************************

      .addCase(leaveRoom.pending, (state: SocketState): void => {
        state.isLoading = true
        state.errorMessage = undefined
      })
      .addCase(leaveRoom.fulfilled, (state: SocketState, action): void => {
        const { roomId } = action.payload

        state.isLoading = false
        delete state.rooms[roomId]
      })
      .addCase(leaveRoom.rejected, (state: SocketState, action): void => {
        state.isLoading = false
        state.errorMessage = action.payload
      })

      // **************************************************
      // * Room Info
      // **************************************************

      .addCase(fetchRoomInfo.pending, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = true
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isRoomInfoLoading: true,
          errorMessage: undefined,
        }
        state.errorMessage = undefined
      })
      .addCase(fetchRoomInfo.fulfilled, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          roomInfo: action.payload,
          isRoomInfoLoading: false,
        }
      })
      .addCase(fetchRoomInfo.rejected, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isRoomInfoLoading: false,
          errorMessage: action.payload,
        }
      })

      // **************************************************
      // * Room Tables
      // **************************************************

      .addCase(fetchRoomTables.pending, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = true
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isRoomTablesLoading: true,
        }
        state.errorMessage = undefined
      })
      .addCase(fetchRoomTables.fulfilled, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          roomTables: action.payload,
          isRoomTablesLoading: false,
        }
      })
      .addCase(fetchRoomTables.rejected, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isRoomTablesLoading: false,
          errorMessage: action.payload,
        }
      })

      // **************************************************
      // * Room Chat
      // **************************************************

      .addCase(fetchRoomChat.pending, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = true
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isChatLoading: true,
        }
        state.errorMessage = undefined
      })
      .addCase(fetchRoomChat.fulfilled, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          chat: action.payload,
          isChatLoading: false,
        }
      })
      .addCase(fetchRoomChat.rejected, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isChatLoading: false,
          errorMessage: action.payload,
        }
      })

      // **************************************************
      // * Room Users
      // **************************************************

      .addCase(fetchRoomUsers.pending, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = true
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isUsersLoading: true,
        }
        state.errorMessage = undefined
      })
      .addCase(fetchRoomUsers.fulfilled, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          users: action.payload,
          isUsersLoading: false,
        }
      })
      .addCase(fetchRoomUsers.rejected, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          isUsersLoading: false,
          errorMessage: action.payload,
        }
      })

      // **************************************************
      // * Join Table
      // **************************************************

      .addCase(joinTable.pending, (state: SocketState): void => {
        state.isLoading = true
        state.errorMessage = undefined
      })
      .addCase(joinTable.fulfilled, (state: SocketState, action): void => {
        const { tableId } = action.payload

        state.isLoading = false
        state.tables[tableId] = {
          tableInfo: null,
          isTableInfoLoading: false,
          chat: [],
          isChatLoading: false,
          users: [],
          isUsersLoading: false,
          errorMessage: undefined,
        }
      })
      .addCase(joinTable.rejected, (state: SocketState, action): void => {
        state.isLoading = false
        state.errorMessage = action.payload
      })

      // **************************************************
      // * Leave Table
      // **************************************************

      .addCase(leaveTable.pending, (state: SocketState): void => {
        state.isLoading = true
        state.errorMessage = undefined
      })
      .addCase(leaveTable.fulfilled, (state: SocketState, action): void => {
        const { tableId } = action.payload

        state.isLoading = false
        delete state.tables[tableId]
      })
      .addCase(leaveTable.rejected, (state: SocketState, action): void => {
        state.isLoading = false
        state.errorMessage = action.payload
      })

      // **************************************************
      // * Table Info
      // **************************************************

      .addCase(fetchTableInfo.pending, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = true
        state.tables[tableId] = {
          ...state.tables[tableId],
          isTableInfoLoading: true,
        }
        state.errorMessage = undefined
      })
      .addCase(fetchTableInfo.fulfilled, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          tableInfo: action.payload,
          isTableInfoLoading: false,
        }
      })
      .addCase(fetchTableInfo.rejected, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          isTableInfoLoading: false,
          errorMessage: action.payload,
        }
      })

      // **************************************************
      // * Table Chat
      // **************************************************

      .addCase(fetchTableChat.pending, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = true
        state.tables[tableId] = {
          ...state.tables[tableId],
          isChatLoading: true,
        }
        state.errorMessage = undefined
      })
      .addCase(fetchTableChat.fulfilled, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          chat: action.payload,
          isChatLoading: false,
        }
      })
      .addCase(fetchTableChat.rejected, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          isChatLoading: false,
          errorMessage: action.payload,
        }
      })

      // **************************************************
      // * Table Users
      // **************************************************

      .addCase(fetchTableUsers.pending, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = true
        state.tables[tableId] = {
          ...state.tables[tableId],
          isUsersLoading: true,
        }
        state.errorMessage = undefined
      })
      .addCase(fetchTableUsers.fulfilled, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          users: action.payload,
          isUsersLoading: false,
        }
      })
      .addCase(fetchTableUsers.rejected, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          isUsersLoading: false,
          errorMessage: action.payload,
        }
      })
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
  removeUserFromRoom,
  roomErrorMessage,
  joinTableSocketRoom,
  beforeLeaveTableSocketRoom,
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
