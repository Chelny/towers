import { RoomLevel, TowersRoom } from "@prisma/client"

export const mockRoom1: TowersRoom = {
  id: "28015627-f4d1-46f5-a863-b6da71b3b97e",
  name: "Eiffel Tower",
  difficulty: RoomLevel.SOCIAL,
  full: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom2: TowersRoom = {
  id: "3d3858f4-2c3a-4ae6-a2ec-2725152618a1",
  name: "Empire State Building",
  difficulty: RoomLevel.BEGINNER,
  full: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom3: TowersRoom = {
  id: "a6388cd8-2e74-4d09-add4-23e5d5d31ad2",
  name: "CN Tower",
  difficulty: RoomLevel.ADVANCED,
  full: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}
