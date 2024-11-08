import { TableType, TowersTable } from "@prisma/client"

export const mockRoom1Table1: TowersTable = {
  id: "7eae47e5-3b1c-462c-9d9f-1f3b4ca2b8eb",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableNumber: 1,
  hostId: "b96a633f-5945-44b2-8075-696a6d09fec2",
  tableType: TableType.PUBLIC,
  rated: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table2: TowersTable = {
  id: "be6c9c4c-27cf-4fd1-88b3-ffa834611576",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableNumber: 2,
  hostId: "d5850073-736a-4078-af51-73c40fa5eba2",
  tableType: TableType.PROTECTED,
  rated: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table3: TowersTable = {
  id: "baa53a4c-4764-40d4-9f1d-701ffe1204a8",
  roomId: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  tableNumber: 3,
  hostId: "3f813c7c-0599-4bee-a641-403a11b32ce8",
  tableType: TableType.PRIVATE,
  rated: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}
