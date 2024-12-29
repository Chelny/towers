import { createId } from "@paralleldrive/cuid2"
import { RoomLevel, TowersRoom } from "@prisma/client"

export const mockRoom1: TowersRoom = {
  id: createId(),
  name: "Eiffel Tower",
  difficulty: RoomLevel.SOCIAL,
  full: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom2: TowersRoom = {
  id: createId(),
  name: "Empire State Building",
  difficulty: RoomLevel.BEGINNER,
  full: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockRoom3: TowersRoom = {
  id: createId(),
  name: "CN Tower",
  difficulty: RoomLevel.ADVANCED,
  full: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}
