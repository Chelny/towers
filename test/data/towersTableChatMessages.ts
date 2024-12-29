import { createId } from "@paralleldrive/cuid2"
import { TableChatMessageType, TowersTableChatMessage } from "@prisma/client"
import { mockRoom1Table1 } from "@/test/data/tables"
import { mockRoom1Table1TowersUserProfile1, mockRoom1Table1TowersUserProfile2 } from "@/test/data/towersUserProfiles"
import { mockUser1, mockUser2 } from "@/test/data/users"

export const mockRoom1Table1TowersChatMessage1: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: `*** ${mockUser1.username} joined the table.`,
  type: TableChatMessageType.USER_ACTION,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage2: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "*** T ==> 9",
  type: TableChatMessageType.CIPHER_KEY,
  privateToUserId: mockUser2.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage3: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Hey!",
  type: TableChatMessageType.CHAT,
  privateToUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage4: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Wazzup?",
  type: TableChatMessageType.CHAT,
  privateToUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage5: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: `*** ${mockUser1.username}’s old rating: 2050; new rating: 2040`,
  type: TableChatMessageType.GAME_RATING,
  privateToUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage6: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message:
    "*** You are the host of the table. This gives you the power to invite to [or boot people from] your table. You may also limit other player’s access to your table by selecting its \"Table Type\".",
  type: TableChatMessageType.TABLE_HOST,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage7: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "*** Only people you have invited may play now.",
  type: TableChatMessageType.TABLE_TYPE,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage8: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "*** V ==> M",
  type: TableChatMessageType.CIPHER_KEY,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage9: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE",
  type: TableChatMessageType.HERO_MESSAGE,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}
