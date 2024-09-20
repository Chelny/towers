import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  RoomChatMessageInput,
  RoomChatWithTowersGameUser,
  RoomWithTablesCount,
  TableChatMessageInput,
  TableChatWithTowersGameUser,
  TableWithHostAndTowersGameUsers,
  TowersGameUserWithUserAndTables
} from "@/interfaces"
import {
  fetchRoomChat,
  fetchRoomInfo,
  fetchRoomUsers,
  fetchTableChat,
  fetchTableInfo,
  fetchTableUsers,
  joinRoom,
  leaveRoom
} from "@/redux/thunks"

export interface RoomsState {
  roomInfo: RoomWithTablesCount | null
  isRoomInfoLoading: boolean
  chat: RoomChatWithTowersGameUser[]
  isChatLoading: boolean
  users: TowersGameUserWithUserAndTables[]
  isUsersLoading: boolean
}

export interface TablesState {
  tableInfo: TableWithHostAndTowersGameUsers | null
  isTableInfoLoading: boolean
  chat: TableChatWithTowersGameUser[]
  isChatLoading: boolean
  users: TowersGameUserWithUserAndTables[]
  isUsersLoading: boolean
}

export interface SocketState {
  isLoading: boolean
  isConnected: boolean
  rooms: Record<string, RoomsState>
  tables: Record<string, TablesState>
  errorMessage?: string
}

const initialState: SocketState = {
  isLoading: false,
  isConnected: false,
  rooms: {},
  tables: {},
  errorMessage: undefined
}

type RoomAction = PayloadAction<{
  room: string
  isTable: boolean
  username: string
}>
type RoomChatMessageInputAction = PayloadAction<RoomChatMessageInput>
type RoomChatMessageAction = PayloadAction<{ roomId: string; data: RoomChatWithTowersGameUser }>
type TableChatMessageInputAction = PayloadAction<TableChatMessageInput>
type TableChatMessageAction = PayloadAction<{ tableId: string; data: TableChatWithTowersGameUser }>

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    initSocket: (state: SocketState) => {
      state.isConnected = false
    },
    destroySocket: (state: SocketState) => {
      state.isConnected = false
    },
    connectionEstablished: (state: SocketState) => {
      state.isConnected = true
    },
    connectionLost: (state: SocketState) => {
      state.isConnected = false
    },
    joinSocketRoom: (state: SocketState, action: RoomAction) => {},
    beforeLeaveSocketRoom: (state: SocketState, action: RoomAction) => {},
    sendMessageToRoomChat: (state: SocketState, action: RoomChatMessageInputAction) => {},
    setRoomChatMessage: (state: SocketState, action: RoomChatMessageAction) => {
      const { roomId, data } = action.payload

      state.rooms[roomId] = {
        ...state.rooms[roomId],
        chat: [...state.rooms[roomId]?.chat, data]
      }
    },
    sendMessageToTableChat: (state: SocketState, action: TableChatMessageInputAction) => {},
    setTableChatMessage: (state: SocketState, action: TableChatMessageAction) => {
      const { tableId, data } = action.payload

      state.tables[tableId] = {
        ...state.tables[tableId],
        chat: [...state.tables[tableId]?.chat, data]
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<SocketState>) => {
    builder
      /**
       * Join Socket Room
       */
      .addCase(joinRoom.pending, (state: SocketState) => {
        state.isLoading = true
      })
      .addCase(joinRoom.fulfilled, (state: SocketState, action) => {
        const { room, isTable } = action.payload

        state.isLoading = false

        if (isTable) {
          state.tables[room] = {
            tableInfo: null,
            isTableInfoLoading: false,
            chat: [],
            isChatLoading: false,
            users: [],
            isUsersLoading: false
          }
        } else {
          state.rooms[room] = {
            roomInfo: null,
            isRoomInfoLoading: false,
            chat: [],
            isChatLoading: false,
            users: [],
            isUsersLoading: false
          }
        }
      })
      .addCase(joinRoom.rejected, (state: SocketState, action) => {
        state.isLoading = false
        state.errorMessage = action.payload
      })
      /**
       * Leave Socket Room
       */
      .addCase(leaveRoom.pending, (state: SocketState) => {
        state.isLoading = true
      })
      .addCase(leaveRoom.fulfilled, (state: SocketState, action) => {
        const { room, isTable } = action.payload

        state.isLoading = false

        if (isTable) {
          delete state.tables[room]
        } else {
          delete state.rooms[room]
        }
      })
      .addCase(leaveRoom.rejected, (state: SocketState, action) => {
        state.isLoading = false
        state.errorMessage = action.payload
      })
      /**
       * Room info
       */
      .addCase(fetchRoomInfo.pending, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = true

        if (state.rooms[roomId]) {
          state.rooms[roomId].isRoomInfoLoading = true
        }
      })
      .addCase(fetchRoomInfo.fulfilled, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          roomInfo: action.payload,
          isRoomInfoLoading: false
        }
      })
      .addCase(fetchRoomInfo.rejected, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = false

        if (state.rooms[roomId]) {
          state.rooms[roomId].isRoomInfoLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Room chat
       */
      .addCase(fetchRoomChat.pending, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = true

        if (state.rooms[roomId]) {
          state.rooms[roomId].isChatLoading = true
        }
      })
      .addCase(fetchRoomChat.fulfilled, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          chat: action.payload,
          isChatLoading: false
        }
      })
      .addCase(fetchRoomChat.rejected, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = false

        if (state.rooms[roomId]) {
          state.rooms[roomId].isChatLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Room users
       */
      .addCase(fetchRoomUsers.pending, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = true

        if (state.rooms[roomId]) {
          state.rooms[roomId].isUsersLoading = true
        }
      })
      .addCase(fetchRoomUsers.fulfilled, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          users: action.payload,
          isUsersLoading: false
        }
      })
      .addCase(fetchRoomUsers.rejected, (state: SocketState, action) => {
        const roomId: string = action.meta.arg

        state.isLoading = false

        if (state.rooms[roomId]) {
          state.rooms[roomId].isUsersLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Table info
       */
      .addCase(fetchTableInfo.pending, (state: SocketState, action) => {
        const tableId: string = action.meta.arg

        state.isLoading = true

        if (state.tables[tableId]) {
          state.tables[tableId].isTableInfoLoading = true
        }
      })
      .addCase(fetchTableInfo.fulfilled, (state: SocketState, action) => {
        const tableId: string = action.meta.arg

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          tableInfo: action.payload,
          isTableInfoLoading: false
        }
      })
      .addCase(fetchTableInfo.rejected, (state: SocketState, action) => {
        const tableId: string = action.meta.arg

        state.isLoading = false

        if (state.tables[tableId]) {
          state.tables[tableId].isTableInfoLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Table chat
       */
      .addCase(fetchTableChat.pending, (state: SocketState, action) => {
        const { tableId }: { tableId: string; towersUserId: string } = action.meta.arg

        state.isLoading = true

        if (state.tables[tableId]) {
          state.tables[tableId].isChatLoading = true
        }
      })
      .addCase(fetchTableChat.fulfilled, (state: SocketState, action) => {
        const { tableId }: { tableId: string; towersUserId: string } = action.meta.arg

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          chat: action.payload,
          isChatLoading: false
        }
      })
      .addCase(fetchTableChat.rejected, (state: SocketState, action) => {
        const { tableId }: { tableId: string; towersUserId: string } = action.meta.arg

        state.isLoading = false

        if (state.tables[tableId]) {
          state.tables[tableId].isChatLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Table users
       */
      .addCase(fetchTableUsers.pending, (state: SocketState, action) => {
        const tableId: string = action.meta.arg

        state.isLoading = true

        if (state.tables[tableId]) {
          state.tables[tableId].isUsersLoading = true
        }
      })
      .addCase(fetchTableUsers.fulfilled, (state: SocketState, action) => {
        const tableId: string = action.meta.arg

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          users: action.payload,
          isUsersLoading: false
        }
      })
      .addCase(fetchTableUsers.rejected, (state: SocketState, action) => {
        const tableId: string = action.meta.arg

        state.isLoading = false

        if (state.tables[tableId]) {
          state.tables[tableId].isUsersLoading = false
        }

        state.errorMessage = action.payload
      })
  }
})

export const {
  initSocket,
  destroySocket,
  connectionEstablished,
  connectionLost,
  joinSocketRoom,
  beforeLeaveSocketRoom,
  sendMessageToRoomChat,
  setRoomChatMessage,
  sendMessageToTableChat,
  setTableChatMessage
} = socketSlice.actions

export default socketSlice.reducer
