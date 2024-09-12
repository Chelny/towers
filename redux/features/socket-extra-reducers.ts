import { ActionReducerMapBuilder } from "@reduxjs/toolkit"
import { SocketState } from "@/redux/features"
import {
  fetchRoomChatData,
  fetchRoomData,
  fetchRoomUsersData,
  fetchTableChatData,
  fetchTableData,
  fetchTableUsersData,
  joinRoom,
  leaveRoom
} from "@/redux/thunks"

export const socketExtraReducers = (builder: ActionReducerMapBuilder<SocketState>) => {
  builder
    // Join Socket Room
    .addCase(joinRoom.pending, (state) => {
      state.loading = true
    })
    .addCase(joinRoom.fulfilled, (state, action) => {
      const { room, isTable, username } = action.payload
      state.loading = false
    })
    .addCase(joinRoom.rejected, (state, action) => {
      state.error = action.payload
      state.loading = false
    })
    // Leave Socket Room
    .addCase(leaveRoom.pending, (state) => {
      state.loading = true
    })
    .addCase(leaveRoom.fulfilled, (state, action) => {
      const { room, isTable, username } = action.payload
      state.loading = false
    })
    .addCase(leaveRoom.rejected, (state, action) => {
      state.error = action.payload
      state.loading = false
    })
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
