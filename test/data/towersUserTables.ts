import { createId } from "@paralleldrive/cuid2"
import { TowersUserTable } from "@prisma/client"
import { mockRoom1 } from "@/test/data/rooms"
import { mockRoom1Table1, mockRoom1Table2, mockRoom1Table3 } from "@/test/data/tables"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2,
  mockRoom1Table1TowersUserProfile3,
  mockRoom1Table1TowersUserProfile4,
  mockRoom1Table1TowersUserProfile5,
} from "@/test/data/towersUserProfiles"
import {
  mockRoom1Table1TowersUserRoom1,
  mockRoom1Table1TowersUserRoom2,
  mockRoom1Table1TowersUserRoom3,
  mockRoom1Table1TowersUserRoom4,
  mockRoom1Table1TowersUserRoom5,
} from "@/test/data/towersUserRooms"

export const mockRoom1Table1TowersUserTable1: TowersUserTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 1,
  userRoomId: mockRoom1Table1TowersUserRoom1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserTable2: TowersUserTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 2,
  userRoomId: mockRoom1Table1TowersUserRoom2.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserTable3: TowersUserTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile3.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 3,
  userRoomId: mockRoom1Table1TowersUserRoom3.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserTable4: TowersUserTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile4.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table2.id,
  seatNumber: null,
  userRoomId: mockRoom1Table1TowersUserRoom4.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserTable5: TowersUserTable = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile5.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table3.id,
  seatNumber: null,
  userRoomId: mockRoom1Table1TowersUserRoom5.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}
