import { createId } from "@paralleldrive/cuid2"
import { TowersRoomChatMessage } from "@prisma/client"
import { mockRoom1 } from "@/test/data/rooms"
import { mockRoom1Table1TowersUserProfile1, mockRoom1Table1TowersUserProfile2 } from "@/test/data/towersUserProfiles"

export const mockRoom1TowersRoomChatMessage1: TowersRoomChatMessage = {
  id: createId(),
  roomId: mockRoom1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "Hey!",
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1TowersRoomChatMessage2: TowersRoomChatMessage = {
  id: createId(),
  roomId: mockRoom1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Wazzup?",
  createdAt: new Date(),
  updatedAt: new Date(),
}
