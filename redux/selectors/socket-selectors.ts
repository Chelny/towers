import { ITowersUserProfile, ITowersUserTableWithRelations } from "@prisma/client"
import { createSelector } from "@reduxjs/toolkit"
import { TowersRoomState, TowersRoomTableState, TowersTableState } from "@/interfaces/socket"
import { Session } from "@/lib/auth-client"
import { RootState } from "@/redux/store"

// **************************************************
// * Room Selectors
// **************************************************

export const selectRooms = (state: RootState) => state.socket?.towers?.rooms
export const selectRoomById = (state: RootState, roomId: string) => selectRooms(state)?.[roomId]

export const selectRoomIsJoined = createSelector(
  [selectRooms, (state: RootState, roomId: string) => roomId],
  (rooms: Record<string, TowersRoomState>, roomId: string) => !!rooms[roomId],
)

export const selectRoomInfo = createSelector([selectRoomById], (room: TowersRoomState) => room?.info || null)
export const selectIsRoomInfoLoading = createSelector([selectRoomById], (room: TowersRoomState) => room?.isInfoLoading)

export const selectRoomChat = createSelector([selectRoomById], (room: TowersRoomState) => room?.chat || [])
export const selectIsRoomChatLoading = createSelector([selectRoomById], (room: TowersRoomState) => room?.isChatLoading)

export const selectRoomUsers = createSelector([selectRoomById], (room: TowersRoomState) => room?.users || [])
export const selectIsRoomUsersLoading = createSelector(
  [selectRoomById],
  (room: TowersRoomState) => room?.isUsersLoading,
)

export const selectRoomTables = createSelector([selectRoomById], (room: TowersRoomState) => {
  return room?.tables ? Object.values(room.tables).map((table: TowersRoomTableState) => table) : []
})
export const selectIsRoomTablesLoading = createSelector(
  [selectRoomById],
  (room: TowersRoomState) => room?.isTablesLoading,
)

// **************************************************
// * Table Selectors
// **************************************************

export const selectTables = (state: RootState) => state.socket?.towers?.tables
export const selectTableById = (state: RootState, tableId: string) => selectTables(state)?.[tableId]

export const selectTableIsJoined = createSelector(
  [selectTables, (state: RootState, tableId: string) => tableId],
  (tables: Record<string, TowersTableState>, tableId: string) => !!tables[tableId],
)

export const selectTableInfo = createSelector([selectTableById], (table: TowersTableState) => table?.info || null)
export const selectIsTableInfoLoading = createSelector(
  [selectTableById],
  (table: TowersTableState) => table?.isInfoLoading,
)

export const selectTableChat = createSelector([selectTableById], (table: TowersTableState) => table?.chat || [])
export const selectIsTableChatLoading = createSelector(
  [selectTableById],
  (table: TowersTableState) => table?.isChatLoading,
)

export const selectTableUsers = createSelector([selectTableById], (table: TowersTableState) => table?.users || [])
export const selectIsTableUsersLoading = createSelector(
  [selectTableById],
  (table: TowersTableState) => table?.isUsersLoading,
)
export const selectRoomUsersInvite = createSelector(
  [
    selectRoomById,
    (state: RootState, tableId: string) => tableId,
    (state: RootState, tableId: string, session: Session | null) => session,
  ],
  (room: TowersRoomState, tableId: string, session: Session | null) => {
    if (!room || !session?.user.id) return []

    return (
      room.users?.filter((towersUserProfile: ITowersUserProfile) => {
        // Exclude the current user (session.user)
        if (towersUserProfile.userId === session.user.id) return false

        // Check if the user is already in the table
        const isUserInTable: boolean | undefined = towersUserProfile.userTables?.some(
          (userTable: ITowersUserTableWithRelations) => userTable.tableId === tableId,
        )

        // Exclude users already in the table
        return !isUserInTable
      }) || []
    )
  },
)
export const selectTableUsersBoot = createSelector(
  [selectTableById, (state: RootState, tableId: string, session: Session | null) => session],
  (table: TowersTableState, session: Session | null) => {
    if (!table || !session?.user.id) return []

    return (
      table.users?.filter((towersUserProfile: ITowersUserProfile) => towersUserProfile.userId !== session.user.id) || []
    )
  },
)
