/* eslint-disable no-unused-vars */
import { RoomInfoWithTablesCount, RoomMessage, TableInfo, TableMessage, TowersUser } from "@prisma/client"
import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RoomChatMessageInput } from "@/interfaces/room-chat"
import { TableChatMessageInput } from "@/interfaces/table-chat"
import { fetchRoomChat, fetchRoomInfo, fetchRoomUsers } from "@/redux/thunks/room-thunks"
import { joinRoom, leaveRoom } from "@/redux/thunks/socket-thunks"
import { fetchTableChat, fetchTableInfo, fetchTableUsers } from "@/redux/thunks/table-thunks"

export interface RoomsState {
  roomInfo: RoomInfoWithTablesCount | null
  isRoomInfoLoading: boolean
  chat: RoomMessage[]
  isChatLoading: boolean
  users: TowersUser[]
  isUsersLoading: boolean
}

export interface TablesState {
  tableInfo: TableInfo | null
  isTableInfoLoading: boolean
  chat: TableMessage[]
  isChatLoading: boolean
  users: TowersUser[]
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

type SocketErrorAction = PayloadAction<string | undefined>
type RoomAction = PayloadAction<{
  roomId?: string
  tableId?: string
  tableIds?: string[]
  username: string
}>
type RoomChatMessageInputAction = PayloadAction<RoomChatMessageInput>
type RoomChatMessageAction = PayloadAction<{ roomId: string; data: RoomMessage }>
type TableChatMessageInputAction = PayloadAction<TableChatMessageInput>
type TableChatMessageAction = PayloadAction<{ tableId: string; data: TableMessage }>
type ServerErrorAction = PayloadAction<string>

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    initSocket: (state: SocketState): void => {
      state.isConnected = false
      state.errorMessage = undefined
    },
    destroySocket: (state: SocketState): void => {
      state.isConnected = false
    },
    connectionEstablished: (state: SocketState): void => {
      state.isConnected = true
      state.errorMessage = undefined
    },
    connectionLost: (state: SocketState, action: SocketErrorAction): void => {
      state.isConnected = false
      state.errorMessage = action.payload
    },
    serverError: (state: SocketState, action: ServerErrorAction): void => {
      state.errorMessage = action.payload
    },
    joinSocketRoom: (state: SocketState, action: RoomAction): void => {},
    beforeLeaveSocketRoom: (state: SocketState, action: RoomAction): void => {},
    sendMessageToRoomChat: (state: SocketState, action: RoomChatMessageInputAction): void => {},
    setRoomChatMessage: (state: SocketState, action: RoomChatMessageAction): void => {
      const { roomId, data } = action.payload

      state.rooms[roomId] = {
        ...state.rooms[roomId],
        chat: [...state.rooms[roomId]?.chat, data]
      }
    },
    sendMessageToTableChat: (state: SocketState, action: TableChatMessageInputAction): void => {},
    setTableChatMessage: (state: SocketState, action: TableChatMessageAction): void => {
      const { tableId, data } = action.payload

      state.tables[tableId] = {
        ...state.tables[tableId],
        chat: [...state.tables[tableId]?.chat, data]
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<SocketState>): void => {
    builder
      /**
       * Join Socket Room
       */
      .addCase(joinRoom.pending, (state: SocketState): void => {
        state.isLoading = true
      })
      .addCase(joinRoom.fulfilled, (state: SocketState, action): void => {
        const { roomId, tableId } = action.payload

        state.isLoading = false

        if (tableId) {
          state.tables[tableId] = {
            tableInfo: null,
            isTableInfoLoading: false,
            chat: [],
            isChatLoading: false,
            users: [],
            isUsersLoading: false
          }
        } else {
          state.rooms[roomId] = {
            roomInfo: null,
            isRoomInfoLoading: false,
            chat: [],
            isChatLoading: false,
            users: [],
            isUsersLoading: false
          }
        }
      })
      .addCase(joinRoom.rejected, (state: SocketState, action): void => {
        state.isLoading = false
        state.errorMessage = action.payload
      })
      /**
       * Leave Socket Room
       */
      .addCase(leaveRoom.pending, (state: SocketState): void => {
        state.isLoading = true
      })
      .addCase(leaveRoom.fulfilled, (state: SocketState, action): void => {
        const { roomId, tableId } = action.payload

        state.isLoading = false

        if (tableId) {
          delete state.tables[tableId]
        } else {
          delete state.rooms[roomId]
        }
      })
      .addCase(leaveRoom.rejected, (state: SocketState, action): void => {
        state.isLoading = false
        state.errorMessage = action.payload
      })
      /**
       * Room info
       */
      .addCase(fetchRoomInfo.pending, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = true

        if (state.rooms[roomId]) {
          state.rooms[roomId].isRoomInfoLoading = true
        }
      })
      .addCase(fetchRoomInfo.fulfilled, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          roomInfo: action.payload,
          isRoomInfoLoading: false
        }
      })
      .addCase(fetchRoomInfo.rejected, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false

        if (state.rooms[roomId]) {
          state.rooms[roomId].isRoomInfoLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Room chat
       */
      .addCase(fetchRoomChat.pending, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = true

        if (state.rooms[roomId]) {
          state.rooms[roomId].isChatLoading = true
        }
      })
      .addCase(fetchRoomChat.fulfilled, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          chat: action.payload,
          isChatLoading: false
        }
      })
      .addCase(fetchRoomChat.rejected, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false

        if (state.rooms[roomId]) {
          state.rooms[roomId].isChatLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Room users
       */
      .addCase(fetchRoomUsers.pending, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = true

        if (state.rooms[roomId]) {
          state.rooms[roomId].isUsersLoading = true
        }
      })
      .addCase(fetchRoomUsers.fulfilled, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          users: action.payload,
          isUsersLoading: false
        }
      })
      .addCase(fetchRoomUsers.rejected, (state: SocketState, action): void => {
        const roomId: string = action.meta.arg.roomId

        state.isLoading = false

        if (state.rooms[roomId]) {
          state.rooms[roomId].isUsersLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Table info
       */
      .addCase(fetchTableInfo.pending, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = true

        if (state.tables[tableId]) {
          state.tables[tableId].isTableInfoLoading = true
        }
      })
      .addCase(fetchTableInfo.fulfilled, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          tableInfo: action.payload,
          isTableInfoLoading: false
        }
      })
      .addCase(fetchTableInfo.rejected, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false

        if (state.tables[tableId]) {
          state.tables[tableId].isTableInfoLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Table chat
       */
      .addCase(fetchTableChat.pending, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = true

        if (state.tables[tableId]) {
          state.tables[tableId].isChatLoading = true
        }
      })
      .addCase(fetchTableChat.fulfilled, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          chat: action.payload,
          isChatLoading: false
        }
      })
      .addCase(fetchTableChat.rejected, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false

        if (state.tables[tableId]) {
          state.tables[tableId].isChatLoading = false
        }

        state.errorMessage = action.payload
      })
      /**
       * Table users
       */
      .addCase(fetchTableUsers.pending, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = true

        if (state.tables[tableId]) {
          state.tables[tableId].isUsersLoading = true
        }
      })
      .addCase(fetchTableUsers.fulfilled, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

        state.isLoading = false
        state.tables[tableId] = {
          ...state.tables[tableId],
          users: action.payload,
          isUsersLoading: false
        }
      })
      .addCase(fetchTableUsers.rejected, (state: SocketState, action): void => {
        const tableId: string = action.meta.arg.tableId

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
  serverError,
  joinSocketRoom,
  beforeLeaveSocketRoom,
  sendMessageToRoomChat,
  setRoomChatMessage,
  sendMessageToTableChat,
  setTableChatMessage
} = socketSlice.actions

export default socketSlice.reducer
