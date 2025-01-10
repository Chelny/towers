import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableChatMessage,
  ITowersUserProfile,
} from "@prisma/client"

export interface SocketState {
  isConnected: boolean
  towers: TowersState
  isLoading: boolean
  errorMessage: string | null
}

export interface TowersState {
  rooms: Record<string, TowersRoomState>
  tables: Record<string, TowersTableState>
}

export interface TowersRoomState {
  info: ITowersRoom | null
  isInfoLoading: boolean
  chat: ITowersRoomChatMessage[]
  isChatLoading: boolean
  users: ITowersUserProfile[]
  isUsersLoading: boolean
  tables: Record<string, TowersRoomTableState>
  isTablesLoading: boolean
  errorMessage: string | null
}

export interface TowersRoomTableState {
  info: ITowersTable | null
  users: ITowersUserProfile[]
}

export interface TowersTableState {
  info: ITowersTable | null
  isInfoLoading: boolean
  chat: ITowersTableChatMessage[]
  isChatLoading: boolean
  users: ITowersUserProfile[]
  isUsersLoading: boolean
  errorMessage: string | null
}
