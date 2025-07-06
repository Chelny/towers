import { RoomLevel } from "db"
import { parseArgs } from "node:util"
import { logger } from "@/lib/logger"
import prisma from "@/lib/prisma"

const options = {
  environment: { type: "string" },
}

async function main(): Promise<void> {
  const {
    values: { environment: _ },
    // @ts-ignore
  } = parseArgs({ options })

  // **************************************************
  // * TowersRoom
  // **************************************************

  await prisma.towersRoom.createMany({
    data: [
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
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    logger.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
