import { Room, Table } from "@prisma/client"
import { TowersGameUserWithUser } from "@/interfaces/towers-game-user"

export interface TableWithHostAndTowersGameUsers extends Table {
  room?: Room
  host: TowersGameUserWithUser
  towersGameUsers: TowersGameUserWithUser[]
}
