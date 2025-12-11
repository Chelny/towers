import { RoomLevel } from "db/browser";
import { parseArgs } from "node:util";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

const options = {
  environment: { type: "string" },
};

async function main(): Promise<void> {
  const {
    values: { environment: _ },
    // @ts-ignore
  } = parseArgs({ options });

  // **************************************************
  // * TowersRoom
  // **************************************************

  await prisma.towersRoom.createMany({
    data: [
      { name: "Leaning Montreal Tower", level: RoomLevel.SOCIAL, sortOrder: 1 },
      { name: "The Bow", level: RoomLevel.SOCIAL, sortOrder: 2 },
      { name: "Eiffel Tower", level: RoomLevel.SOCIAL, sortOrder: 3 },
      { name: "First Canadian Place", level: RoomLevel.BEGINNER, sortOrder: 4 },
      { name: "Empire State Building", level: RoomLevel.BEGINNER, sortOrder: 5 },
      { name: "The Shard", level: RoomLevel.BEGINNER, sortOrder: 6 },
      { name: "Q1 Tower", level: RoomLevel.BEGINNER, sortOrder: 7 },
      { name: "One World Trade Center", level: RoomLevel.INTERMEDIATE, sortOrder: 8 },
      { name: "CN Tower", level: RoomLevel.INTERMEDIATE, sortOrder: 9 },
      { name: "Lotte World Tower", level: RoomLevel.INTERMEDIATE, sortOrder: 10 },
      { name: "Tokyo Skytree", level: RoomLevel.INTERMEDIATE, sortOrder: 11 },
      { name: "Merdeka 118", level: RoomLevel.ADVANCED, sortOrder: 12 },
      { name: "Burj Khalifa", level: RoomLevel.ADVANCED, sortOrder: 13 },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
