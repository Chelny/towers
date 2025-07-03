import { Room, RoomLevel } from "@/server/towers/classes/Room"

export const rooms: Map<string, Room> = new Map<string, Room>()

const roomsList = [
  { name: "Leaning Tower of Pisa", level: RoomLevel.SOCIAL },
  { name: "Tower of Babble", level: RoomLevel.SOCIAL },
  { name: "Eiffel Tower", level: RoomLevel.SOCIAL },
  { name: "Sunshine 60 Tower", level: RoomLevel.SOCIAL },
  { name: "Two Union Square", level: RoomLevel.SOCIAL },
  { name: "Empire State Building", level: RoomLevel.BEGINNER },
  { name: "Sears Tower", level: RoomLevel.BEGINNER },
  { name: "Chang Tower", level: RoomLevel.BEGINNER },
  { name: "One Astor Place", level: RoomLevel.BEGINNER },
  { name: "Olympia Centre", level: RoomLevel.BEGINNER },
  { name: "World Trade Center", level: RoomLevel.INTERMEDIATE },
  { name: "CN Tower", level: RoomLevel.ADVANCED },
]

roomsList.forEach((roomItem) => {
  const room: Room = new Room(roomItem.name, roomItem.level)
  rooms.set(room.id, room)
})
