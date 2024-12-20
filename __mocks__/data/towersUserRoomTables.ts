import { createId } from "@paralleldrive/cuid2"
import { TowersUserRoomTable } from "@prisma/client"
import { mockRoom1 } from "@/__mocks__/data/rooms"
import { mockRoom1Table1, mockRoom1Table2, mockRoom1Table3 } from "@/__mocks__/data/tables"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2,
  mockRoom1Table1TowersUserProfile3,
  mockRoom1Table1TowersUserProfile4,
  mockRoom1Table1TowersUserProfile5,
} from "@/__mocks__/data/towersUserProfiles"

export const mockRoom1Table1TowersUserRoomTable1: TowersUserRoomTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable2: TowersUserRoomTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable3: TowersUserRoomTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile3.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable4: TowersUserRoomTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile4.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table2.id,
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable5: TowersUserRoomTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile5.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table3.id,
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}
