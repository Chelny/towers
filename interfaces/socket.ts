import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  ITowersUserRoomTable,
} from "@prisma/client"

export interface SocketState {
  isConnected: boolean
  isLoading: boolean
  towers: Record<string, TowersRoomState>
  errorMessage: string | null
}

export interface TowersRoomState {
  isJoined: boolean
  info: ITowersRoom | null
  isInfoLoading: boolean
  chat: ITowersRoomChatMessage[]
  isChatLoading: boolean
  users: ITowersUserRoomTable[]
  isUsersLoading: boolean
  tables: Record<string, TowersTableState>
  isTablesLoading: boolean
  errorMessage: string | null
}

export interface TowersTableState {
  isJoined: boolean
  info: ITowersTable | null
  isInfoLoading: boolean
  chat: ITowersTableChatMessage[]
  isChatLoading: boolean
  users: ITowersUserRoomTable[]
  isUsersLoading: boolean
  errorMessage: string | null
}
