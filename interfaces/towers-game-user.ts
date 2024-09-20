import { Table, TowersGameUser, User } from "@prisma/client"

export type TowersGameUserWithUser = TowersGameUser & { user: User }

export type TowersGameUserWithUserAndTables = TowersGameUser & { user: User; table: Table | null }
