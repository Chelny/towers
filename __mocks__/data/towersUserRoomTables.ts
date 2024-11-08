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
  id: "0363c781-c9b0-483a-8ea3-4d42ad418e6d",
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable2: TowersUserRoomTable = {
  id: "620f42aa-a748-4ede-b741-bd14ea245137",
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable3: TowersUserRoomTable = {
  id: "98ad4401-9932-418a-98f5-3df1025956e0",
  userProfileId: mockRoom1Table1TowersUserProfile3.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable4: TowersUserRoomTable = {
  id: "a2950f76-75bb-4005-bb54-8bbed65af0f6",
  userProfileId: mockRoom1Table1TowersUserProfile4.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table2.id,
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoomTable5: TowersUserRoomTable = {
  id: "ec2257b3-9c0b-49f0-8954-9e416d24344f",
  userProfileId: mockRoom1Table1TowersUserProfile5.id,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table3.id,
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}
