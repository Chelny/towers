import { Session } from "@/lib/auth-client"

export interface TowersSeat {
  number: number
  user: Session["user"] | undefined | null
  isReady: boolean
}

export interface TowersTeam {
  rowSpan: number
  teamNumber: number
  seats: TowersSeat[]
}
