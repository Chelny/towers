import { ITowersTable } from "@prisma/client"
import { ActionReducerMapBuilder } from "@reduxjs/toolkit"
import { SocketState, TowersTableState } from "@/interfaces/socket"
import {
  fetchRoomChat,
  fetchRoomInfo,
  fetchRoomTables,
  fetchRoomUsers,
  joinRoom,
  leaveRoom
} from "@/redux/thunks/room-thunks"
import { fetchTableChat, fetchTableInfo, fetchTableUsers, joinTable, leaveTable } from "@/redux/thunks/table-thunks"

export const socketExtraReducers = (builder: ActionReducerMapBuilder<SocketState>): void => {
  builder

    // **************************************************
    // * Join Room
    // **************************************************

    .addCase(joinRoom.pending, (state: SocketState): void => {
      state.isLoading = true
      state.errorMessage = null
    })
    .addCase(joinRoom.fulfilled, (state: SocketState, action): void => {
      const { roomId } = action.payload

      state.isLoading = false
      state.towers[roomId] = {
        isJoined: true,
        info: null,
        isInfoLoading: false,
        chat: [],
        isChatLoading: false,
        users: [],
        isUsersLoading: false,
        tables: {},
        isTablesLoading: false,
        errorMessage: null
      }
    })
    .addCase(joinRoom.rejected, (state: SocketState, action): void => {
      state.isLoading = false
      state.errorMessage = action.payload || null
    })

    // **************************************************
    // * Leave Room
    // **************************************************

    .addCase(leaveRoom.pending, (state: SocketState): void => {
      state.isLoading = true
      state.errorMessage = null
    })
    .addCase(leaveRoom.fulfilled, (state: SocketState, action): void => {
      const { roomId } = action.payload

      state.isLoading = false
      delete state.towers[roomId]
    })
    .addCase(leaveRoom.rejected, (state: SocketState, action): void => {
      state.isLoading = false
      state.errorMessage = action.payload || null
    })

    // **************************************************
    // * Room Info
    // **************************************************

    .addCase(fetchRoomInfo.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isInfoLoading: true,
        errorMessage: null
      }
    })
    .addCase(fetchRoomInfo.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        info: action.payload,
        isInfoLoading: false
      }
    })
    .addCase(fetchRoomInfo.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isInfoLoading: false,
        errorMessage: action.payload || null
      }
    })

    // **************************************************
    // * Room Chat
    // **************************************************

    .addCase(fetchRoomChat.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isChatLoading: true,
        errorMessage: null
      }
    })
    .addCase(fetchRoomChat.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        chat: action.payload,
        isChatLoading: false
      }
    })
    .addCase(fetchRoomChat.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isChatLoading: false,
        errorMessage: action.payload || null
      }
    })

    // **************************************************
    // * Room Users
    // **************************************************

    .addCase(fetchRoomUsers.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isUsersLoading: true,
        errorMessage: null
      }
    })
    .addCase(fetchRoomUsers.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        users: action.payload,
        isUsersLoading: false
      }
    })
    .addCase(fetchRoomUsers.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isUsersLoading: false,
        errorMessage: action.payload || null
      }
    })

    // **************************************************
    // * Room Tables
    // **************************************************

    .addCase(fetchRoomTables.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isTablesLoading: true,
        errorMessage: null
      }
    })
    .addCase(fetchRoomTables.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId
      const tables: ITowersTable[] = action.payload

      const tablesMap: Record<string, Partial<TowersTableState>> = tables.reduce(
        (acc: Record<string, Partial<TowersTableState>>, table: ITowersTable) => {
          const { userRoomTables, ...tableInfo } = table
          acc[table.id] = { info: tableInfo, users: userRoomTables }
          return acc
        },
        {}
      )

      state.towers[roomId].tables = Object.keys(tablesMap).reduce(
        (updatedTables: Record<string, TowersTableState>, tableId: string) => {
          updatedTables[tableId] = {
            ...state.towers[roomId].tables[tableId],
            ...tablesMap[tableId]
          }
          return updatedTables
        },
        {}
      )

      state.towers[roomId].isTablesLoading = false
    })
    .addCase(fetchRoomTables.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers[roomId] = {
        ...state.towers[roomId],
        isTablesLoading: false,
        errorMessage: action.payload || null
      }
    })

    // **************************************************
    // * Join Table
    // **************************************************

    .addCase(joinTable.pending, (state: SocketState): void => {
      state.isLoading = true
      state.errorMessage = null
    })
    .addCase(joinTable.fulfilled, (state: SocketState, action): void => {
      const { roomId, tableId } = action.payload

      state.isLoading = false

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          isJoined: true,
          info: null,
          isInfoLoading: false,
          chat: [],
          isChatLoading: false,
          users: [],
          isUsersLoading: false,
          errorMessage: null
        }
      }
    })
    .addCase(joinTable.rejected, (state: SocketState, action): void => {
      state.isLoading = false
      state.errorMessage = action.payload || null
    })

    // **************************************************
    // * Leave Table
    // **************************************************

    .addCase(leaveTable.pending, (state: SocketState): void => {
      state.isLoading = true
      state.errorMessage = null
    })
    .addCase(leaveTable.fulfilled, (state: SocketState, action): void => {
      const { roomId, tableId } = action.payload

      state.isLoading = false

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          isJoined: false
        }
      }
    })
    .addCase(leaveTable.rejected, (state: SocketState, action): void => {
      state.isLoading = false
      state.errorMessage = action.payload || null
    })

    // **************************************************
    // * Table Info
    // **************************************************

    .addCase(fetchTableInfo.pending, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          isInfoLoading: true,
          errorMessage: null
        }
      }
    })
    .addCase(fetchTableInfo.fulfilled, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          info: action.payload,
          isInfoLoading: false
        }
      }
    })
    .addCase(fetchTableInfo.rejected, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          isInfoLoading: false,
          errorMessage: action.payload || null
        }
      }
    })

    // **************************************************
    // * Table Chat
    // **************************************************

    .addCase(fetchTableChat.pending, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          isChatLoading: true,
          errorMessage: null
        }
      }
    })
    .addCase(fetchTableChat.fulfilled, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          chat: action.payload,
          isChatLoading: false
        }
      }
    })
    .addCase(fetchTableChat.rejected, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          isChatLoading: false,
          errorMessage: action.payload || null
        }
      }
    })

    // **************************************************
    // * Table Users
    // **************************************************

    .addCase(fetchTableUsers.pending, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          isUsersLoading: true,
          errorMessage: null
        }
      }
    })
    .addCase(fetchTableUsers.fulfilled, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          users: action.payload,
          isUsersLoading: false
        }
      }
    })
    .addCase(fetchTableUsers.rejected, (state: SocketState, action): void => {
      const { roomId, tableId } = action.meta.arg

      if (state.towers[roomId]?.tables?.[tableId]) {
        state.towers[roomId].tables[tableId] = {
          ...state.towers[roomId].tables[tableId],
          isUsersLoading: false,
          errorMessage: action.payload || null
        }
      }
    })
}
