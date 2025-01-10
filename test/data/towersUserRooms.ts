import { createId } from "@paralleldrive/cuid2"
import { TowersUserRoom } from "@prisma/client"
import { mockRoom1 } from "@/test/data/rooms"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2,
  mockRoom1Table1TowersUserProfile3,
  mockRoom1Table1TowersUserProfile4,
  mockRoom1Table1TowersUserProfile5,
} from "@/test/data/towersUserProfiles"

export const mockRoom1Table1TowersUserRoom1: TowersUserRoom = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  roomId: mockRoom1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoom2: TowersUserRoom = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  roomId: mockRoom1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoom3: TowersUserRoom = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile3.id,
  roomId: mockRoom1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoom4: TowersUserRoom = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile4.id,
  roomId: mockRoom1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserRoom5: TowersUserRoom = {
  id: createId(),
  userProfileId: mockRoom1Table1TowersUserProfile5.id,
  roomId: mockRoom1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}
