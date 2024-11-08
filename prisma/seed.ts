import {
  RoomLevel,
  TableType,
  TowersRoomChatMessage,
  TowersTable,
  TowersTableChatMessage,
  TowersUserProfile,
  User,
  UserStatus,
} from "@prisma/client"
import { parseArgs } from "node:util"
import prisma from "@/lib/prisma"

const options = {
  environment: { type: "string" },
}

async function main(): Promise<void> {
  const {
    values: { environment },
    // @ts-ignore
  } = parseArgs({ options })

  // **************************************************
  // * TowersRoom
  // **************************************************

  await prisma.towersRoom.createMany({
    data: [
      { name: "Leaning Tower of Pisa", difficulty: RoomLevel.SOCIAL },
      { name: "Tower of Babble", difficulty: RoomLevel.SOCIAL },
      { name: "Eiffel Tower", difficulty: RoomLevel.SOCIAL },
      { name: "Sunshine 60 Tower", difficulty: RoomLevel.SOCIAL },
      { name: "Two Union Square", difficulty: RoomLevel.SOCIAL },
      { name: "Empire State Building", difficulty: RoomLevel.BEGINNER },
      { name: "Sears Tower", difficulty: RoomLevel.BEGINNER },
      { name: "Chang Tower", difficulty: RoomLevel.BEGINNER },
      { name: "One Astor Place", difficulty: RoomLevel.BEGINNER },
      { name: "Olympia Centre", difficulty: RoomLevel.BEGINNER },
      { name: "World Trade Center", difficulty: RoomLevel.INTERMEDIATE },
      { name: "CN Tower", difficulty: RoomLevel.ADVANCED },
    ],
  })

  if (environment === "development") {
    // **************************************************
    // * Users
    // **************************************************

    type TUser = Omit<Pick<User, "name" | "email" | "username" | "birthdate">, "birthdate"> & {
      birthdate?: Date | null
    }

    const userData: TUser[] = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        username: "john.doe",
        birthdate: new Date("1990-01-01"),
      },
      {
        name: "Jane Smith",
        email: "marryj@example.com",
        username: "jane_smith",
      },
      {
        name: "Sam Lee",
        email: "slee1951@example.com",
        username: "samlee5141234567",
        birthdate: new Date("1951-07-21"),
      },
      {
        name: "Chris Green",
        email: "itschris85@example.co.jp",
        username: "itschris85",
        birthdate: new Date("1985-05-15"),
      },
      {
        name: "Patricia White",
        email: "patricia_j_white@example.com",
        username: "triciaj",
      },
    ]

    await prisma.user.createMany({
      data: userData.map((user: TUser) => ({
        ...user,
        password: "$2a$12$.a4AhkJrYEAefd2Ok3S4YOKNPiYMO44GCthg.DwwPgY4eqmoPjqWC",
        emailVerified: new Date(),
        isOnline: true,
        lastActiveAt: new Date(),
        status: UserStatus.ACTIVE,
      })),
    })

    const users: User[] = await prisma.user.findMany()

    // **************************************************
    // * TowersRoom
    // **************************************************

    const towersRoom1 = await prisma.towersRoom.findUnique({
      where: {
        name: "Eiffel Tower",
      },
    })

    if (towersRoom1) {
      // **************************************************
      // * TowersUserProfile
      // **************************************************

      const towersUserProfileData: Partial<TowersUserProfile>[] = users.map((user: User) => ({
        userId: user.id,
        rating: Math.floor(Math.random() * 4000) + 1000,
        gamesCompleted: Math.floor(Math.random() * 100),
        wins: Math.floor(Math.random() * 50),
        loses: Math.floor(Math.random() * 50),
        streak: Math.floor(Math.random() * 5),
      }))

      await prisma.towersUserProfile.createMany({ data: towersUserProfileData as TowersUserProfile[] })

      const towersUserProfiles: TowersUserProfile[] = await prisma.towersUserProfile.findMany()

      // **************************************************
      // * TowersTable
      // **************************************************

      type TTable = Pick<TowersTable, "tableNumber" | "hostId" | "tableType" | "rated">

      const tablesData: TTable[] = [
        {
          tableNumber: 1,
          hostId: towersUserProfiles[0].id,
          tableType: TableType.PUBLIC,
          rated: true,
        },
        {
          tableNumber: 2,
          hostId: towersUserProfiles[3].id,
          tableType: TableType.PROTECTED,
          rated: false,
        },
        {
          tableNumber: 3,
          hostId: towersUserProfiles[4].id,
          tableType: TableType.PRIVATE,
          rated: true,
        },
      ]

      await prisma.towersTable.createMany({
        data: tablesData.map((table: TTable) => ({
          ...table,
          roomId: towersRoom1.id,
        })),
      })

      const tables: TowersTable[] = await prisma.towersTable.findMany()

      // **************************************************
      // * TowersUserRoomTable
      // **************************************************

      for (let i = 0; i < towersUserProfiles.length; i++) {
        if (i < 3) {
          await prisma.towersUserRoomTable.create({
            data: {
              userProfileId: towersUserProfiles[i].id,
              roomId: tables[0].roomId,
              tableId: tables[0].id,
              seatNumber: i + 1,
            },
          })
        } else if (i === 3) {
          await prisma.towersUserRoomTable.create({
            data: {
              userProfileId: towersUserProfiles[i].id,
              roomId: tables[1].roomId,
              tableId: tables[1].id,
            },
          })
        } else if (i === 4) {
          await prisma.towersUserRoomTable.create({
            data: {
              userProfileId: towersUserProfiles[i].id,
              roomId: tables[2].roomId,
              tableId: tables[2].id,
            },
          })
        }
      }

      // **************************************************
      // * TowersRoomChatMessage
      // **************************************************

      type TRoomChatMessage = Pick<TowersRoomChatMessage, "userProfileId" | "message">

      const roomChatMessages: TRoomChatMessage[] = [
        {
          userProfileId: towersUserProfiles[0].id,
          message: "Hello from Room 1!",
        },
        {
          userProfileId: towersUserProfiles[1].id,
          message: "Hey everyone!",
        },
        {
          userProfileId: towersUserProfiles[2].id,
          message: "Let’s play!",
        },
      ]

      await prisma.towersRoomChatMessage.createMany({
        data: roomChatMessages.map((message: TRoomChatMessage) => ({
          ...message,
          roomId: towersRoom1.id,
        })),
      })

      // **************************************************
      // * TowersTableChatMessage
      // **************************************************

      type TTableChatMessage = Pick<TowersTableChatMessage, "userProfileId" | "message">

      const tableChatMessages: TTableChatMessage[] = [
        {
          userProfileId: towersUserProfiles[0].id,
          message: "Hello from Room 1!",
        },
        {
          userProfileId: towersUserProfiles[1].id,
          message: "Hey everyone!",
        },
        {
          userProfileId: towersUserProfiles[2].id,
          message: "Let’s play!",
        },
        {
          userProfileId: towersUserProfiles[0].id,
          message: "Hi!! Let the game begin!",
        },
        {
          userProfileId: towersUserProfiles[1].id,
          message: "Let’s GOOOOO!",
        },
      ]

      // Create chat messages for table 1 in room 1
      await prisma.towersTableChatMessage.createMany({
        data: tableChatMessages.map((message: TTableChatMessage) => ({
          ...message,
          tableId: tables[0].id,
        })),
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
