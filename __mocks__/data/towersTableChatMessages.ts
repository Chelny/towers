import { TableChatMessageType, TowersTableChatMessage } from "@prisma/client"
import { mockRoom1Table1 } from "@/__mocks__/data/tables"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2,
} from "@/__mocks__/data/towersUserProfiles"
import { mockUser1, mockUser2 } from "@/__mocks__/data/users"

export const mockRoom1Table1TowersChatMessage1: TowersTableChatMessage = {
  id: "1effe75e-e637-4110-b276-4bd9954128ee",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: `*** ${mockUser1.username} joined the table.`,
  type: TableChatMessageType.USER_ACTION,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage2: TowersTableChatMessage = {
  id: "1f014cfd-015c-4a60-803a-53344532abf9",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "*** T ==> 9",
  type: TableChatMessageType.CIPHER_KEY,
  privateToUserId: mockUser2.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage3: TowersTableChatMessage = {
  id: "36293139-3493-4db1-a393-4301789f3d89",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Hey!",
  type: TableChatMessageType.CHAT,
  privateToUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage4: TowersTableChatMessage = {
  id: "418ec943-e620-4ff9-9d26-37ead4c5e9ae",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile2.id,
  message: "Wazzup?",
  type: TableChatMessageType.CHAT,
  privateToUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage5: TowersTableChatMessage = {
  id: "e77ee20a-094c-42e3-b1ee-a167317778c5",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: `*** ${mockUser1.username}’s old rating: 2050; new rating: 2040`,
  type: TableChatMessageType.GAME_RATING,
  privateToUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage6: TowersTableChatMessage = {
  id: "2082a4d5-c281-44e8-b75b-38a2ca60591c",
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
  id: "11160e3c-4e83-4917-b7c0-1097bcdc942c",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "*** Only people you have invited may play now.",
  type: TableChatMessageType.TABLE_TYPE,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage8: TowersTableChatMessage = {
  id: "cdcba5b2-8d01-4166-ae48-ef4bd61c4366",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "*** V ==> M",
  type: TableChatMessageType.CIPHER_KEY,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersChatMessage9: TowersTableChatMessage = {
  id: "38b8c715-5310-493d-8b94-339bd163e653",
  tableId: mockRoom1Table1.id,
  userProfileId: mockRoom1Table1TowersUserProfile1.id,
  message: "2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE",
  type: TableChatMessageType.HERO_MESSAGE,
  privateToUserId: mockUser1.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}
