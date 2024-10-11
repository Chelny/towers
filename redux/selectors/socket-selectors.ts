import { ITowersTable, ITowersUserProfile, ITowersUserProfileWithRelations, IUserWithRelations } from "@prisma/client"
import { createSelector } from "@reduxjs/toolkit"
import { Session } from "next-auth"
import { RoomState, TableState } from "@/redux/features/socket-slice"
import { RootState } from "@/redux/store"

// **************************************************
// * Room Selectors
// **************************************************

export const selectRooms = (state: RootState) => state.socket.rooms
export const selectRoomById = (state: RootState, roomId: string) => selectRooms(state)[roomId]

export const selectRoomInfo = createSelector([selectRoomById], (room: RoomState) => room?.roomInfo || null)
export const selectIsRoomInfoLoading = createSelector([selectRoomById], (room: RoomState) => room?.isRoomInfoLoading)

export const selectRoomTables = createSelector([selectRoomById], (room: RoomState) => room?.roomTables || [])
export const selectIsRoomTablesLoading = createSelector(
  [selectRoomById],
  (room: RoomState) => room?.isRoomTablesLoading
)
export const selectTableByIdInRoom = createSelector(
  [selectRoomById, (state: RootState, roomId: string, tableId: string) => tableId],
  (room: RoomState | null, tableId: string) =>
    room?.roomTables?.find((table: ITowersTable) => table.id === tableId) || null
)

export const selectRoomChat = createSelector([selectRoomById], (room: RoomState) => room?.chat || [])
export const selectIsRoomChatLoading = createSelector([selectRoomById], (room: RoomState) => room?.isChatLoading)

export const selectRoomUsers = createSelector([selectRoomById], (room: RoomState) => room?.users || [])
export const selectIsRoomUsersLoading = createSelector([selectRoomById], (room: RoomState) => room?.isUsersLoading)

// **************************************************
// * Table Selectors
// **************************************************

export const selectTables = (state: RootState) => state.socket.tables
export const selectTableById = (state: RootState, tableId: string) => selectTables(state)[tableId]

export const selectTableInfo = createSelector([selectTableById], (table: TableState) => table?.tableInfo || null)
export const selectIsTableInfoLoading = createSelector(
  [selectTableById],
  (table: TableState) => table?.isTableInfoLoading
)

export const selectTableChat = createSelector([selectTableById], (table: TableState) => table?.chat || [])
export const selectIsTableChatLoading = createSelector([selectTableById], (table: TableState) => table?.isChatLoading)

export const selectTableUsers = createSelector([selectTableById], (table: TableState) => table?.users || [])
export const selectIsTableUsersLoading = createSelector([selectTableById], (table: TableState) => table?.isUsersLoading)
export const selectRoomUsersInvite = createSelector(
  [
    (state: RootState, roomId: string) => selectRoomById(state, roomId),
    (state: RootState, roomId: string, tableId: string) => tableId
  ],
  (room: RoomState | null, tableId: string) =>
    (room?.users || []).filter((towersUserProfile: ITowersUserProfile) => towersUserProfile.tableId !== tableId)
)
export const selectTableUsersBoot = createSelector(
  [
    (state: RootState, tableId: string) => selectTableById(state, tableId),
    (state: RootState, tableId: string, session: Session | null) => session?.user.id
  ],
  (table: TableState, sessionUserId: string | undefined) =>
    (table?.users || []).filter((towersUserProfile: ITowersUserProfile) => towersUserProfile.userId !== sessionUserId)
)
export const selectNextTableHost = createSelector(
  [(state: RootState, tableId: string) => selectTableById(state, tableId)],
  (table): IUserWithRelations | null => {
    const sortedUsers: ITowersUserProfile[] = table?.users
      ?.slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return sortedUsers?.[0]?.user || null
  }
)
