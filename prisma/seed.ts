import { RoomLevel, TableType, UserStatus } from "@prisma/client"
import { parseArgs } from "node:util"
import prisma from "@/lib/prisma"

const options = {
  environment: { type: "string" }
}

async function main() {
  const {
    values: { environment }
    // @ts-ignore
  } = parseArgs({ options })

  if (environment === "production") {
  } else if (environment === "staging") {
  } else {
    // development
    // Create users
    const usersData = [
      {
        name: "John Doe",
        email: "test_john@example.dev",
        username: "johndoe",
        birthdate: new Date("1990-01-01")
      },
      {
        name: "Jane Smith",
        email: "test_jane@example.dev",
        username: "janesmith",
        birthdate: new Date("1985-05-15")
      },
      {
        name: "Sam Lee",
        email: "test_sam@example.dev",
        username: "samlee",
        birthdate: new Date("2000-07-21")
      },
      {
        name: "Chris Green",
        email: "test_chris@example.dev",
        username: "chrisgreen"
      },
      {
        name: "Patricia White",
        email: "test_patricia@example.dev",
        username: "patwhite"
      }
    ]

    await prisma.user.createMany({
      data: usersData.map((user) => ({
        ...user,
        password: "$2a$12$.a4AhkJrYEAefd2Ok3S4YOKNPiYMO44GCthg.DwwPgY4eqmoPjqWC",
        emailVerified: new Date(),
        isOnline: true,
        lastActiveAt: new Date(),
        status: UserStatus.ACTIVE
      }))
    })

    // Create rooms
    await prisma.room.createMany({
      data: [
        { name: "Eiffel Tower", difficulty: RoomLevel.SOCIAL },
        { name: "Empire State Building", difficulty: RoomLevel.BEGINNER },
        { name: "CN Tower", difficulty: RoomLevel.ADVANCED }
      ]
    })

    const room1 = await prisma.room.findUnique({
      where: {
        name: "Eiffel Tower"
      }
    })

    if (room1) {
      const users = await prisma.user.findMany()

      // Set user game data
      const towersUserProfileData = users.map((user) => ({
        userId: user.id,
        rating: Math.floor(Math.random() * 4000) + 1000,
        gamesCompleted: Math.floor(Math.random() * 100),
        wins: Math.floor(Math.random() * 50),
        loses: Math.floor(Math.random() * 50),
        streak: Math.floor(Math.random() * 5)
      }))

      await prisma.towersUserProfile.createMany({ data: towersUserProfileData })

      const towersUserProfiles = await prisma.towersUserProfile.findMany()

      // Create tables in room 1
      const tablesData = [
        {
          tableNumber: 1,
          hostId: towersUserProfiles[0].id,
          tableType: TableType.PUBLIC,
          rated: true
        },
        {
          tableNumber: 2,
          hostId: towersUserProfiles[1].id,
          tableType: TableType.PROTECTED,
          rated: false
        },
        {
          tableNumber: 3,
          hostId: towersUserProfiles[2].id,
          tableType: TableType.PRIVATE,
          rated: true
        }
      ]

      await prisma.table.createMany({
        data: tablesData.map((table) => ({
          ...table,
          roomId: room1.id
        }))
      })

      const tables = await prisma.table.findMany()

      // Add users to the tables in room 1
      for (let i = 0; i < towersUserProfiles.length; i++) {
        if (i < 3) {
          await prisma.towersUserRoomTable.create({
            data: {
              towersUserProfileId: towersUserProfiles[i].id,
              roomId: tables[0].roomId,
              tableId: tables[0].id,
              seatNumber: i + 1
            }
          })
        } else if (i === 3) {
          await prisma.towersUserRoomTable.create({
            data: {
              towersUserProfileId: towersUserProfiles[i].id,
              roomId: tables[1].roomId,
              tableId: tables[1].id
            }
          })
        } else if (i === 4) {
          await prisma.towersUserRoomTable.create({
            data: {
              towersUserProfileId: towersUserProfiles[i].id,
              roomId: tables[2].roomId,
              tableId: tables[2].id
            }
          })
        }
      }

      // Create chat messages for room 1
      const roomChatMessages = [
        {
          towersUserProfileId: towersUserProfiles[4].id,
          message: "Hello from Room 1!"
        },
        {
          towersUserProfileId: towersUserProfiles[1].id,
          message: "Hey everyone!"
        },
        {
          towersUserProfileId: towersUserProfiles[2].id,
          message: "Let’s play!"
        }
      ]

      await prisma.roomChat.createMany({
        data: roomChatMessages.map((message) => ({
          ...message,
          roomId: room1.id
        }))
      })

      const tableChatMessages = [
        {
          towersUserProfileId: towersUserProfiles[1].id,
          message: "Hello from Room 1!"
        },
        {
          towersUserProfileId: towersUserProfiles[4].id,
          message: "Hey everyone!"
        },
        {
          towersUserProfileId: towersUserProfiles[1].id,
          message: "Let’s play!"
        },
        {
          towersUserProfileId: towersUserProfiles[3].id,
          message: "Hi!! Let the game begin!"
        },
        {
          towersUserProfileId: towersUserProfiles[4].id,
          message: "Let’s GOOOOO!"
        }
      ]

      // Create chat messages for table 1 in room 1
      await prisma.tableChat.createMany({
        data: tableChatMessages.map((message) => ({
          ...message,
          tableId: tables[0].id
        }))
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
