import { ITowersUserProfileWithRelations, IUserWithRelations } from "@prisma/client"
import { mockRoom1 } from "@/__mocks__/data/rooms"
import { mockRoom1Table1, mockRoom1Table2, mockRoom1Table3 } from "@/__mocks__/data/tables"
import { mockUser1, mockUser2, mockUser3, mockUser4, mockUser5 } from "@/__mocks__/data/users"

export const mockRoom1Table1TowersUserProfile1: ITowersUserProfileWithRelations = {
  id: "b96a633f-5945-44b2-8075-696a6d09fec2",
  userId: mockUser1.id,
  rating: 4159,
  gamesCompleted: 81,
  wins: 5,
  loses: 3,
  streak: 4,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser1,
  room: mockRoom1,
  table: mockRoom1Table1
}

export const mockRoom1Table1TowersUserProfile2: ITowersUserProfileWithRelations = {
  id: "d5850073-736a-4078-af51-73c40fa5eba2",
  userId: mockUser2.id,
  rating: 1897,
  gamesCompleted: 97,
  wins: 9,
  loses: 38,
  streak: 1,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser2,
  room: mockRoom1,
  table: mockRoom1Table1
}

export const mockRoom1Table1TowersUserProfile3: ITowersUserProfileWithRelations = {
  id: "3f813c7c-0599-4bee-a641-403a11b32ce8",
  userId: mockUser3.id,
  rating: 3677,
  gamesCompleted: 96,
  wins: 15,
  loses: 49,
  streak: 0,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table1.id,
  seatNumber: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser3,
  room: mockRoom1,
  table: mockRoom1Table1
}

export const mockRoom1Table1TowersUserProfile4: ITowersUserProfileWithRelations = {
  id: "fb12d58f-3123-4f28-bf50-5d34864fbc76",
  userId: mockUser4.id,
  rating: 1785,
  gamesCompleted: 67,
  wins: 2,
  loses: 40,
  streak: 0,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table2.id,
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser4,
  room: mockRoom1,
  table: mockRoom1Table2
}

export const mockRoom1Table1TowersUserProfile5: ITowersUserProfileWithRelations = {
  id: "b797a2ee-c904-4f32-a8a8-69669fd428fd",
  userId: mockUser5.id,
  rating: 2166,
  gamesCompleted: 38,
  wins: 49,
  loses: 38,
  streak: 3,
  roomId: mockRoom1.id,
  tableId: mockRoom1Table3.id,
  seatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser5,
  room: mockRoom1,
  table: mockRoom1Table3
}

export const mockRoom1Table1ChatUser1: IUserWithRelations = {
  ...mockUser1,
  towersUserProfile: mockRoom1Table1TowersUserProfile1
}

export const mockRoom1Table1ChatUser2: IUserWithRelations = {
  ...mockUser2,
  towersUserProfile: mockRoom1Table1TowersUserProfile2
}
