import { TowersRoomChatMessage } from "@prisma/client"
import { mockRoom1 } from "@/__mocks__/data/rooms"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2
} from "@/__mocks__/data/towersUserProfiles"

export const mockRoom1TowersRoomChatMessage1: TowersRoomChatMessage = {
  id: "397fbe7b-c254-4940-b885-23f7566acfa0",
  roomId: mockRoom1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "Hey!",
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockRoom1TowersRoomChatMessage2: TowersRoomChatMessage = {
  id: "583b22ec-f319-4ff7-adc8-721532fa0ae8",
  roomId: mockRoom1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Wazzup?",
  createdAt: new Date(),
  updatedAt: new Date()
}
