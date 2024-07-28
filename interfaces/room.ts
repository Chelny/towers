import { Room } from "@prisma/client"
import { TableWithHostAndTowersGameUsers } from "@/interfaces"

export interface RoomResponseData {
  roomId: string
  roomData: RoomWithTablesCount
}

export interface RoomWithTablesCount {
  room: RoomWithTables | null
  tablesCount: number
}

export interface RoomWithTables extends Room {
  tables: TableWithHostAndTowersGameUsers[]
}
