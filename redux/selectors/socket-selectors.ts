import { ITowersUserRoomTable } from "@prisma/client"
import { createSelector } from "@reduxjs/toolkit"
import { Session } from "next-auth"
import { TowersRoomState, TowersTableState } from "@/interfaces/socket"
import { RootState } from "@/redux/store"

// **************************************************
// * Room Selectors
// **************************************************

export const selectRooms = (state: RootState) => state.socket.towers
export const selectRoomById = (state: RootState, roomId: string) => selectRooms(state)?.[roomId]

export const selectRoomIsJoined = createSelector([selectRoomById], (room: TowersRoomState) => room?.isJoined)

export const selectRoomInfo = createSelector([selectRoomById], (room: TowersRoomState) => room?.info || null)
export const selectIsRoomInfoLoading = createSelector([selectRoomById], (room: TowersRoomState) => room?.isInfoLoading)

export const selectRoomChat = createSelector([selectRoomById], (room: TowersRoomState) => room?.chat || [])
export const selectIsRoomChatLoading = createSelector([selectRoomById], (room: TowersRoomState) => room?.isChatLoading)

export const selectRoomUsers = createSelector([selectRoomById], (room: TowersRoomState) => room?.users || [])
export const selectIsRoomUsersLoading = createSelector(
  [selectRoomById],
  (room: TowersRoomState) => room?.isUsersLoading
)

export const selectRoomTables = createSelector([selectRoomById], (room: TowersRoomState) => {
  return room?.tables ? Object.values(room.tables).map((table: TowersTableState) => table) : []
})
export const selectIsRoomTablesLoading = createSelector(
  [selectRoomById],
  (room: TowersRoomState) => room?.isTablesLoading
)

// **************************************************
// * Table Selectors
// **************************************************

export const selectTablesByRoomId = (state: RootState, roomId: string) => selectRoomById(state, roomId)?.tables
export const selectTableById = (state: RootState, roomId: string, tableId: string) =>
  selectRoomById(state, roomId)?.tables?.[tableId]

export const selectTableIsJoined = createSelector([selectTableById], (table: TowersTableState) => table?.isJoined)

export const selectTableInfo = createSelector([selectTableById], (table: TowersTableState) => table?.info || null)
export const selectIsTableInfoLoading = createSelector(
  [selectTableById],
  (table: TowersTableState) => table?.isInfoLoading
)

export const selectTableChat = createSelector([selectTableById], (table: TowersTableState) => table?.chat || [])
export const selectIsTableChatLoading = createSelector(
  [selectTableById],
  (table: TowersTableState) => table?.isChatLoading
)

export const selectTableUsers = createSelector([selectTableById], (table: TowersTableState) => table?.users || [])
export const selectIsTableUsersLoading = createSelector(
  [selectTableById],
  (table: TowersTableState) => table?.isUsersLoading
)
export const selectRoomUsersInvite = createSelector(
  [selectRoomById, (state: RootState, roomId: string, tableId: string) => tableId],
  (room: TowersRoomState, tableId: string) =>
    room?.users?.filter((towersUserRoomTable: ITowersUserRoomTable) => towersUserRoomTable.tableId !== tableId)
)
export const selectTableUsersBoot = createSelector(
  [
    selectTableById,
    (state: RootState, roomId: string, tableId: string, session: Session | null) => session?.user.id ?? null
  ],
  (table: TowersTableState, sessionUserId: string | null) =>
    table?.users?.filter(
      (towersUserRoomTable: ITowersUserRoomTable) => towersUserRoomTable.userProfile?.userId !== sessionUserId
    )
)
