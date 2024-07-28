import { Room, Table } from "@prisma/client"
import { TowersGameUserWithUser } from "@/interfaces"

export interface TableResponseData {
  tableId: string
  tableData: TableWithHostAndTowersGameUsers
}

export interface TableWithHostAndTowersGameUsers extends Table {
  room: Room
  host: TowersGameUserWithUser
  towersGameUsers: TowersGameUserWithUser[]
}
