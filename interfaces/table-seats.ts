import { TableSeatPlainObject } from "@/server/towers/classes/TableSeat";

export interface ServerTowersTeam {
  teamNumber: number
  seats: ServerTowersSeat[]
}

export interface ServerTowersSeat extends TableSeatPlainObject {
  targetNumber: number
  isReversed: boolean
}
