import { ITowersTable, ITowersUserTableWithRelations } from "@prisma/client"
import { ActionReducerMapBuilder } from "@reduxjs/toolkit"
import { SocketState, TowersRoomTableState, TowersTableState } from "@/interfaces/socket"
import { fetchRoomChat, fetchRoomInfo, fetchRoomTables, fetchRoomUsers } from "@/redux/thunks/room-thunks"
import { fetchTableChat, fetchTableInfo, fetchTableUsers } from "@/redux/thunks/table-thunks"

export const socketExtraReducers = (builder: ActionReducerMapBuilder<SocketState>): void => {
  builder

    // **************************************************
    // * Room Info
    // **************************************************

    .addCase(fetchRoomInfo.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isInfoLoading: true,
        errorMessage: null,
      }
    })
    .addCase(fetchRoomInfo.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        info: action.payload,
        isInfoLoading: false,
      }
    })
    .addCase(fetchRoomInfo.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isInfoLoading: false,
        errorMessage: action.payload || null,
      }
    })

    // **************************************************
    // * Room Chat
    // **************************************************

    .addCase(fetchRoomChat.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isChatLoading: true,
        errorMessage: null,
      }
    })
    .addCase(fetchRoomChat.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        chat: action.payload,
        isChatLoading: false,
      }
    })
    .addCase(fetchRoomChat.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isChatLoading: false,
        errorMessage: action.payload || null,
      }
    })

    // **************************************************
    // * Room Users
    // **************************************************

    .addCase(fetchRoomUsers.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isUsersLoading: true,
        errorMessage: null,
      }
    })
    .addCase(fetchRoomUsers.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        users: action.payload,
        isUsersLoading: false,
      }
    })
    .addCase(fetchRoomUsers.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isUsersLoading: false,
        errorMessage: action.payload || null,
      }
    })

    // **************************************************
    // * Room Tables
    // **************************************************

    .addCase(fetchRoomTables.pending, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isTablesLoading: true,
        errorMessage: null,
      }
    })
    .addCase(fetchRoomTables.fulfilled, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId
      const tables: ITowersTable[] = action.payload

      const tablesMap: Record<string, Partial<TowersTableState>> = tables.reduce(
        (acc: Record<string, Partial<TowersTableState>>, table: ITowersTable) => {
          const { userTables, ...tableInfo } = table
          acc[table.id] = {
            info: table,
            users: userTables.map((userTable: ITowersUserTableWithRelations) => userTable.userProfile!),
          }
          return acc
        },
        {},
      )

      state.towers.rooms[roomId].tables = Object.keys(tablesMap).reduce(
        (updatedTables: Record<string, TowersRoomTableState>, tableId: string) => {
          updatedTables[tableId] = {
            ...state.towers.rooms[roomId].tables?.[tableId],
            ...tablesMap[tableId],
          }
          return updatedTables
        },
        {},
      )

      state.towers.rooms[roomId].isTablesLoading = false
    })
    .addCase(fetchRoomTables.rejected, (state: SocketState, action): void => {
      const roomId: string = action.meta.arg.roomId

      state.towers.rooms[roomId] = {
        ...state.towers.rooms[roomId],
        isTablesLoading: false,
        errorMessage: action.payload || null,
      }
    })

    // **************************************************
    // * Table Info
    // **************************************************

    .addCase(fetchTableInfo.pending, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          isInfoLoading: true,
          errorMessage: null,
        }
      }
    })
    .addCase(fetchTableInfo.fulfilled, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          info: action.payload,
          isInfoLoading: false,
        }
      }
    })
    .addCase(fetchTableInfo.rejected, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          isInfoLoading: false,
          errorMessage: action.payload || null,
        }
      }
    })

    // **************************************************
    // * Table Chat
    // **************************************************

    .addCase(fetchTableChat.pending, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          isChatLoading: true,
          errorMessage: null,
        }
      }
    })
    .addCase(fetchTableChat.fulfilled, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          chat: action.payload,
          isChatLoading: false,
        }
      }
    })
    .addCase(fetchTableChat.rejected, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          isChatLoading: false,
          errorMessage: action.payload || null,
        }
      }
    })

    // **************************************************
    // * Table Users
    // **************************************************

    .addCase(fetchTableUsers.pending, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          isUsersLoading: true,
          errorMessage: null,
        }
      }
    })
    .addCase(fetchTableUsers.fulfilled, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          users: action.payload,
          isUsersLoading: false,
        }
      }
    })
    .addCase(fetchTableUsers.rejected, (state: SocketState, action): void => {
      const { tableId } = action.meta.arg

      if (state.towers.tables[tableId]) {
        state.towers.tables[tableId] = {
          ...state.towers.tables[tableId],
          isUsersLoading: false,
          errorMessage: action.payload || null,
        }
      }
    })
}
