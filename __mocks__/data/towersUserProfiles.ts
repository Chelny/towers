import { TowersUserProfile } from "@prisma/client"
import { mockUser1, mockUser2, mockUser3, mockUser4, mockUser5 } from "@/__mocks__/data/users"

export const mockRoom1Table1TowersUserProfile1: TowersUserProfile = {
  id: "b96a633f-5945-44b2-8075-696a6d09fec2",
  userId: mockUser1.id,
  rating: 4159,
  gamesCompleted: 81,
  wins: 5,
  loses: 3,
  streak: 4,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockRoom1Table1TowersUserProfile2: TowersUserProfile = {
  id: "d5850073-736a-4078-af51-73c40fa5eba2",
  userId: mockUser2.id,
  rating: 1897,
  gamesCompleted: 97,
  wins: 9,
  loses: 38,
  streak: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockRoom1Table1TowersUserProfile3: TowersUserProfile = {
  id: "3f813c7c-0599-4bee-a641-403a11b32ce8",
  userId: mockUser3.id,
  rating: 3677,
  gamesCompleted: 96,
  wins: 15,
  loses: 49,
  streak: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockRoom1Table1TowersUserProfile4: TowersUserProfile = {
  id: "fb12d58f-3123-4f28-bf50-5d34864fbc76",
  userId: mockUser4.id,
  rating: 1785,
  gamesCompleted: 67,
  wins: 2,
  loses: 40,
  streak: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockRoom1Table1TowersUserProfile5: TowersUserProfile = {
  id: "b797a2ee-c904-4f32-a8a8-69669fd428fd",
  userId: mockUser5.id,
  rating: 2166,
  gamesCompleted: 38,
  wins: 49,
  loses: 38,
  streak: 3,
  createdAt: new Date(),
  updatedAt: new Date()
}
