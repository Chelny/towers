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
import { socketExtraReducers } from "@/redux/features/socket-extra-reducers"

export interface SocketState {
  isConnected: boolean
  socketRooms: Record<string, string>
  rooms: Record<string, RoomWithTablesCount | null>
  roomsLoading: boolean
  roomsChat: Record<string, RoomChatWithTowersGameUser[]>
  roomsChatLoading: boolean
  roomsUsers: Record<string, TowersGameUserWithUserAndTables[]>
  roomsUsersLoading: boolean
  tables: Record<string, TableWithHostAndTowersGameUsers | null>
  tablesLoading: boolean
  tablesChat: Record<string, TableChatWithTowersGameUser[]>
  tablesChatLoading: boolean
  tablesUsers: Record<string, TowersGameUserWithUserAndTables[]>
  tablesUsersLoading: boolean
  error: string | undefined
  loading: boolean
}

const initialState: SocketState = {
  isConnected: false,
  socketRooms: {},
  rooms: {},
  roomsLoading: false,
  roomsChat: {},
  roomsChatLoading: false,
  roomsUsers: {},
  roomsUsersLoading: false,
  tables: {},
  tablesLoading: false,
  tablesChat: {},
  tablesChatLoading: false,
  tablesUsers: {},
  tablesUsersLoading: false,
  error: undefined,
  loading: false
}

type RoomAction = PayloadAction<{
  room: string
  isTable: boolean
  username?: string
}>
type TableAction = PayloadAction<RoomWithTablesCount>
type RoomChatMessageInputAction = PayloadAction<RoomChatMessageInput>
type RoomChatMessageAction = PayloadAction<RoomChatWithTowersGameUser>
type TableChatMessageInputAction = PayloadAction<TableChatMessageInput>
type TableChatMessageAction = PayloadAction<TableChatWithTowersGameUser>

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
    joinSocketRoom: (state: SocketState, action: RoomAction) => {
      const { room, isTable } = action.payload

      state.socketRooms[room] = room

      if (isTable) {
        state.tables[room] = null
        state.tablesUsers[room] = []

        if (!state.tablesChat[room]) {
          state.tablesChat[room] = []
        }
      } else {
        state.rooms[room] = null
        state.roomsUsers[room] = []

        if (!state.roomsChat[room]) {
          state.roomsChat[room] = []
        }
      }
    },
    beforeLeaveSocketRoom: (state: SocketState, action: RoomAction) => {},
    leaveSocketRoom: (state: SocketState, action: RoomAction) => {
      const { room, isTable } = action.payload

      if (isTable) {
        delete state.tables[room]
        delete state.tablesUsers[room]
      } else {
        delete state.rooms[room]
        delete state.roomsUsers[room]
      }

      delete state.socketRooms[room]
    },
    // createTable: (state: SocketState, action: TableAction) => {
    //   const { room, tableId, roomId, hostId, tableType, rated } = action.payload
    //   if (room) {
    //     if (!state.tables[room]) state.tables[room] = []
    //     state.tables[room].push({ tableId, roomId, hostId, tableType, rated })
    //   }
    // },
    // getTables: (state: SocketState, action: TableAction) => {
    //   console.log("getTables", state.room, action.payload)
    // },
    // deleteTable: (state: SocketState, action: TableAction) => {
    //   const { room, tableId } = action.payload
    //   if (room && state.tables[room]) {
    //     state.tables[room] = state.tables[room].filter((table: Table) => table.tableId !== tableId)
    //   }
    // },
    sendMessageToRoomChat: (state: SocketState, action: RoomChatMessageInputAction) => {},
    getRoomChatMessage: (state: SocketState, action: RoomChatMessageAction) => {
      const { roomId: room } = action.payload

      if (!state.roomsChat[room]) {
        state.roomsChat[room] = []
      }

      state.roomsChat[room].push(action.payload)
    },
    sendMessageToTableChat: (state: SocketState, action: TableChatMessageInputAction) => {},
    getTableChatMessage: (state: SocketState, action: TableChatMessageAction) => {
      const { tableId: room } = action.payload

      if (!state.tablesChat[room]) {
        state.tablesChat[room] = []
      }

      state.tablesChat[room].push(action.payload)
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<SocketState>) => {
    socketExtraReducers(builder)
  }
})

export const {
  initSocket,
  destroySocket,
  connectionEstablished,
  connectionLost,
  joinSocketRoom,
  beforeLeaveSocketRoom,
  leaveSocketRoom,
  sendMessageToRoomChat,
  getRoomChatMessage,
  // createTable,
  // deleteTable,
  // getTables,
  sendMessageToTableChat,
  getTableChatMessage
} = socketSlice.actions

export const socketReducer = socketSlice.reducer
