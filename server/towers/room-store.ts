import { Room, RoomLevel } from "@/server/towers/classes/Room"

export const rooms: Map<string, Room> = new Map<string, Room>()

const roomsList = [
  { name: "Leaning Montreal Tower", level: RoomLevel.SOCIAL },
  { name: "Central Park Tower", level: RoomLevel.SOCIAL },
  { name: "Milad Tower", level: RoomLevel.SOCIAL },
  { name: "Merdeka 118", level: RoomLevel.SOCIAL },
  { name: "Ostankino Tower", level: RoomLevel.SOCIAL },
  { name: "Tashkent Tower", level: RoomLevel.BEGINNER },
  { name: "Shanghai Tower", level: RoomLevel.BEGINNER },
  { name: "Kuala Lumpur Tower", level: RoomLevel.BEGINNER },
  { name: "Lotte World Tower", level: RoomLevel.BEGINNER },
  { name: "Tokyo Skytree", level: RoomLevel.BEGINNER },
  { name: "One World Trade Center", level: RoomLevel.INTERMEDIATE },
  { name: "Burj Khalifa", level: RoomLevel.ADVANCED },
]

roomsList.forEach((roomItem) => {
  const room: Room = new Room(roomItem.name, roomItem.level)
  rooms.set(room.id, room)
})
