import { createId } from "@paralleldrive/cuid2"
import { TowersUserProfile } from "@prisma/client"
import { mockUser1, mockUser2, mockUser3, mockUser4, mockUser5 } from "@/test/data/users"

export const mockRoom1Table1TowersUserProfile1: TowersUserProfile = {
  id: createId(),
  userId: mockUser1.id,
  rating: 4159,
  gamesCompleted: 81,
  wins: 5,
  loses: 3,
  streak: 4,
  controls: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserProfile2: TowersUserProfile = {
  id: createId(),
  userId: mockUser2.id,
  rating: 1897,
  gamesCompleted: 97,
  wins: 9,
  loses: 38,
  streak: 1,
  controls: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserProfile3: TowersUserProfile = {
  id: createId(),
  userId: mockUser3.id,
  rating: 3677,
  gamesCompleted: 96,
  wins: 15,
  loses: 49,
  streak: 0,
  controls: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserProfile4: TowersUserProfile = {
  id: createId(),
  userId: mockUser4.id,
  rating: 1785,
  gamesCompleted: 67,
  wins: 2,
  loses: 40,
  streak: 0,
  controls: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom1Table1TowersUserProfile5: TowersUserProfile = {
  id: createId(),
  userId: mockUser5.id,
  rating: 2166,
  gamesCompleted: 38,
  wins: 49,
  loses: 38,
  streak: 3,
  controls: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}
