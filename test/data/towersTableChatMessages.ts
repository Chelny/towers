import { createId } from "@paralleldrive/cuid2"
import { TableChatMessageType, TableType, TowersTableChatMessage } from "@prisma/client"
import { mockRoom1Table1 } from "@/test/data/tables"
import { mockRoom1Table1TowersUserProfile1, mockRoom1Table1TowersUserProfile2 } from "@/test/data/towersUserProfiles"
import { mockUser1, mockUser2 } from "@/test/data/users"

export const mockRoom1Table1TowersChatMessage1: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: null,
  messageVariables: { username: mockUser1.username },
  type: TableChatMessageType.USER_JOINED,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage2: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "*** Cipher key: T ==> 9",
  messageVariables: null,
  type: TableChatMessageType.CIPHER_KEY,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage3: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Hey!",
  messageVariables: null,
  type: TableChatMessageType.CHAT,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage4: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Wazzup?",
  messageVariables: null,
  type: TableChatMessageType.CHAT,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage5: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: null,
  messageVariables: { username: mockUser1.username, oldRating: 2050, newRating: 2040 },
  type: TableChatMessageType.GAME_RATING,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage6: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: null,
  messageVariables: null,
  type: TableChatMessageType.TABLE_HOST,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage7: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: null,
  messageVariables: { tableType: TableType.PROTECTED },
  type: TableChatMessageType.TABLE_TYPE,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage8: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "*** Cipher key: V ==> M",
  messageVariables: null,
  type: TableChatMessageType.CIPHER_KEY,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage9: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE",
  messageVariables: null,
  type: TableChatMessageType.HERO_CODE,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage10: TowersTableChatMessage = {
  id: createId(),
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: null,
  messageVariables: { username: mockUser1.username },
  type: TableChatMessageType.HERO_MESSAGE,
  createdAt: new Date(),
  updatedAt: new Date(),
}
