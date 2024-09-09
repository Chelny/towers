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
  fetchRoomChatData,
  fetchRoomData,
  fetchRoomUsersData,
  fetchTableChatData,
  fetchTableData,
  fetchTableUsersData
} from "@/lib"

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
    joinRoom: (state: SocketState, action: RoomAction) => {
      const { room, isTable } = action.payload

      state.socketRooms[room] = room

      if (isTable) {
        state.tables[room] = null
        state.tablesChat[room] = []
        state.tablesUsers[room] = []
      } else {
        state.rooms[room] = null
        state.roomsChat[room] = []
        state.roomsUsers[room] = []
      }
    },
    leaveRoom: (state: SocketState, action: RoomAction) => {
      const { room, isTable } = action.payload

      delete state.socketRooms[room]

      if (isTable) {
        delete state.tables[room]
        delete state.tablesChat[room]
        delete state.tablesUsers[room]
      } else {
        delete state.rooms[room]
        delete state.roomsChat[room]
        delete state.roomsUsers[room]
      }
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

      if (state.roomsChat[room]) {
        state.roomsChat[room] = []
      }

      state.roomsChat[room].push(action.payload)
    },
    sendMessageToTableChat: (state: SocketState, action: TableChatMessageInputAction) => {},
    getTableChatMessage: (state: SocketState, action: TableChatMessageAction) => {
      const { tableId: room } = action.payload

      if (state.tablesChat[room]) {
        state.tablesChat[room] = []
      }

      state.tablesChat[room].push(action.payload)
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<SocketState>) => {
    builder
      // Room data
      .addCase(fetchRoomData.pending, (state) => {
        state.roomsLoading = true
        state.loading = true
      })
      .addCase(fetchRoomData.fulfilled, (state, action) => {
        const { roomId: room, roomData } = action.payload
        state.rooms[room] = roomData
        state.roomsLoading = false
        state.loading = false
      })
      .addCase(fetchRoomData.rejected, (state, action) => {
        state.error = action.payload
        state.roomsLoading = false
        state.loading = false
      })
      // Room chat data
      .addCase(fetchRoomChatData.pending, (state) => {
        state.roomsChatLoading = true
        state.loading = true
      })
      .addCase(fetchRoomChatData.fulfilled, (state, action) => {
        const { roomId: room, roomChat } = action.payload
        state.roomsChat[room] = roomChat
        state.roomsChatLoading = false
        state.loading = false
      })
      .addCase(fetchRoomChatData.rejected, (state, action) => {
        state.error = action.payload
        state.roomsChatLoading = false
        state.loading = false
      })
      // Room users data
      .addCase(fetchRoomUsersData.pending, (state) => {
        state.roomsUsersLoading = true
        state.loading = true
      })
      .addCase(fetchRoomUsersData.fulfilled, (state, action) => {
        const { roomId: room, roomUsers } = action.payload
        state.roomsUsers[room] = roomUsers
        state.roomsUsersLoading = false
        state.loading = false
      })
      .addCase(fetchRoomUsersData.rejected, (state, action) => {
        state.error = action.payload
        state.roomsUsersLoading = false
        state.loading = false
      })
      // Table data
      .addCase(fetchTableData.pending, (state) => {
        state.tablesLoading = true
        state.loading = true
      })
      .addCase(fetchTableData.fulfilled, (state, action) => {
        const { tableId: room, tableData } = action.payload
        state.tables[room] = tableData
        state.tablesLoading = false
        state.loading = false
      })
      .addCase(fetchTableData.rejected, (state, action) => {
        state.error = action.payload
        state.tablesLoading = false
        state.loading = false
      })
      // Table chat data
      .addCase(fetchTableChatData.pending, (state) => {
        state.tablesChatLoading = true
        state.loading = true
      })
      .addCase(fetchTableChatData.fulfilled, (state, action) => {
        const { tableId: room, tableChat } = action.payload
        state.tablesChat[room] = tableChat
        state.tablesChatLoading = false
        state.loading = false
      })
      .addCase(fetchTableChatData.rejected, (state, action) => {
        state.error = action.payload
        state.tablesChatLoading = false
        state.loading = false
      })
      // Table users data
      .addCase(fetchTableUsersData.pending, (state) => {
        state.tablesUsersLoading = true
        state.loading = true
      })
      .addCase(fetchTableUsersData.fulfilled, (state, action) => {
        const { tableId: room, tableUsers } = action.payload
        state.tablesUsers[room] = tableUsers
        state.tablesUsersLoading = false
        state.loading = false
      })
      .addCase(fetchTableUsersData.rejected, (state, action) => {
        state.error = action.payload
        state.tablesUsersLoading = false
        state.loading = false
      })
  }
})

export const {
  initSocket,
  destroySocket,
  connectionEstablished,
  connectionLost,
  joinRoom,
  leaveRoom,
  // createTable,
  // deleteTable,
  // getTables,
  sendMessageToRoomChat,
  getRoomChatMessage,
  sendMessageToTableChat,
  getTableChatMessage
} = socketSlice.actions

export default socketSlice.reducer
