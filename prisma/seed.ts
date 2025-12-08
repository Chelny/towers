import { RoomLevel } from "db";
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
      { name: "The Shard", level: RoomLevel.SOCIAL, sortOrder: 2 },
      { name: "Merdeka 118", level: RoomLevel.SOCIAL, sortOrder: 3 },
      { name: "The Bow", level: RoomLevel.SOCIAL, sortOrder: 4 },
      { name: "Torre Costanera", level: RoomLevel.SOCIAL, sortOrder: 5 },
      { name: "First Canadian Place", level: RoomLevel.BEGINNER, sortOrder: 6 },
      { name: "Britam Tower", level: RoomLevel.BEGINNER, sortOrder: 7 },
      { name: "Lotte World Tower", level: RoomLevel.BEGINNER, sortOrder: 8 },
      { name: "Q1 Tower", level: RoomLevel.BEGINNER, sortOrder: 9 },
      { name: "Torre de Cristal", level: RoomLevel.BEGINNER, sortOrder: 10 },
      { name: "Tokyo Skytree", level: RoomLevel.BEGINNER, sortOrder: 11 },
      { name: "One World Trade Center", level: RoomLevel.INTERMEDIATE, sortOrder: 12 },
      { name: "Burj Khalifa", level: RoomLevel.ADVANCED, sortOrder: 13 },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
