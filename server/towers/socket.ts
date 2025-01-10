import {
  ITowersRoomChatMessage,
  ITowersUserRoom,
  ITowersUserTable,
  TableChatMessageType,
  TowersRoom,
  TowersTable,
  TowersUserProfile,
  TowersUserTable,
} from "@prisma/client"
import { TowersTableChatMessage } from "@prisma/client"
import { Server, Socket } from "socket.io"
import { DEFAULT_TOWERS_CONTROLS } from "@/constants/game"
import { setUserLastActiveAt } from "@/data/user"
import { Session } from "@/lib/auth-client"
import prisma from "@/lib/prisma"

export const towersSocket = (socket: Socket, io: Server): void => {
  // **************************************************
  // * Room Events
  // **************************************************

  socket.on("room:join", async ({ roomId }) => {
    try {
      const session: Session = getSession(socket)

      const room: TowersRoom | null = await prisma.towersRoom.findUnique({ where: { id: roomId } })
      if (!room) throw Error("The room was not found")

      if (!session.userProfileIds.towers) {
        const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.upsert({
          where: { userId: session.user.id },
          update: {},
          create: {
            userId: session.user.id,
            controls: DEFAULT_TOWERS_CONTROLS,
          },
        })

        session.userProfileIds.towers = towersUserProfile.id
      }

      const towersUserRoom: ITowersUserRoom | null = await prisma.towersUserRoom.upsert({
        where: {
          userProfileId_roomId: {
            userProfileId: session.userProfileIds.towers,
            roomId,
          },
        },
        update: {},
        create: {
          userProfileId: session.userProfileIds.towers,
          roomId,
        },
        include: {
          userProfile: {
            include: {
              user: true,
            },
          },
        },
      })

      setUserLastActiveAt(session.user.id)

      socket.join(roomId)
      io.to(roomId).emit("room:joined", { roomId, towersUserProfile: towersUserRoom.userProfile })
    } catch (error) {
      handleSocketError(socket, error, "Error joining room")
    }
  })

  socket.on("room:leave", async ({ roomId }) => {
    try {
      const session: Session = getSession(socket)

      if (!session?.userProfileIds?.towers) {
        throw new Error("Towers user profile ID is missing.")
      }

      const roomTables: TowersUserTable[] = await prisma.towersUserTable.findMany({
        where: {
          userProfileId: session?.userProfileIds.towers,
          roomId,
        },
      })

      // Loop through each joined table from room and leave the corresponding socket room
      for (const roomTable of roomTables) {
        leaveTable(roomId, roomTable.tableId, session, socket, io)
      }

      // Delete user room
      await prisma.towersUserRoom.delete({
        where: {
          userProfileId_roomId: {
            userProfileId: session?.userProfileIds.towers,
            roomId,
          },
        },
      })

      setUserLastActiveAt(session?.user.id)

      io.to(roomId).emit("room:left", { roomId, user: session?.user })
      socket.leave(roomId)
      io.to(socket.id).emit("room:deleted-self", { roomId })
    } catch (error) {
      handleSocketError(socket, error, "Error leaving room")
    }
  })

  socket.on("room:send-message", async ({ roomId, message }) => {
    try {
      const session: Session = getSession(socket)

      if (!session?.userProfileIds?.towers) {
        throw new Error("Towers user profile ID is missing.")
      }

      const chatMessage: ITowersRoomChatMessage = await prisma.towersRoomChatMessage.create({
        data: {
          roomId,
          userProfileId: session.userProfileIds.towers,
          message,
        },
        include: {
          userProfile: {
            include: {
              user: true,
            },
          },
        },
      })

      await setUserLastActiveAt(session.user.id)

      io.to(roomId).emit("room:message-sent", { roomId, chatMessage })
    } catch (error) {
      console.error(`Error sending message in room ${roomId}. Error description:`, error)

      // FIXME: Manage errors for specific user in a specific room
      // if (axios.isAxiosError(error) && error.response) {
      //   socket.emit("[server] error", error.response.data.message || "An error occurred while sending the message.");
      // } else if (error instanceof Error) {
      //   socket.emit("[server] error", error.message || "An unexpected error occurred.");
      // } else {
      //   socket.emit("[server] error", "An unexpected error occurred.");
      // }
    }
  })

  socket.on("room:update-user", ({ roomId, users }) => {
    io.to(roomId).emit("room:updated-user", { roomId, users })
  })

  // **************************************************
  // * Table Events
  // **************************************************

  socket.on("table:join", async ({ roomId, tableId }) => {
    try {
      const session: Session = getSession(socket)

      const table: TowersTable | null = await prisma.towersTable.findUnique({ where: { id: tableId } })
      if (!table) throw Error("The table was not found")

      if (!session.userProfileIds.towers) {
        const towersUserProfile: TowersUserProfile | null = await prisma.towersUserProfile.upsert({
          where: { userId: session.user.id },
          update: {},
          create: {
            userId: session.user.id,
            controls: DEFAULT_TOWERS_CONTROLS,
          },
        })

        session.userProfileIds.towers = towersUserProfile.id
      }

      const towersUserTable: ITowersUserTable | null = await prisma.towersUserTable.upsert({
        where: {
          userProfileId_tableId: {
            userProfileId: session.userProfileIds.towers,
            tableId,
          },
        },
        update: {},
        create: {
          userProfileId: session.userProfileIds.towers,
          roomId,
          tableId,
        },
        include: {
          userProfile: {
            include: {
              user: true,
            },
          },
          table: true,
        },
      })

      const isUserJoinedTheTable: boolean = towersUserTable && towersUserTable.createdAt === towersUserTable.updatedAt

      await setUserLastActiveAt(session.user.id)

      socket.join(tableId)
      io.to(tableId).emit("table:joined", {
        roomId,
        tableId,
        towersUserProfile: towersUserTable.userProfile,
        isUserJoinedTheTable,
      })
    } catch (error) {
      handleSocketError(socket, error, "Error joining table")
    }
  })

  socket.on("table:leave", async ({ roomId, tableId }) => {
    try {
      const session: Session = getSession(socket)

      leaveTable(roomId, tableId, session, socket, io)
    } catch (error) {
      handleSocketError(socket, error, "Error leaving table")
    }
  })

  socket.on("table:create", ({ roomId, table }) => {
    io.to(roomId).emit("table:created", { roomId, table })
  })

  socket.on("table:update", async ({ roomId, tableId, table, towersUserProfiles }) => {
    try {
      const towersTable: TowersTable = await prisma.towersTable.update({
        where: { id: tableId },
        data: table,
      })

      io.to(roomId).emit("table:updated", { roomId, tableId, table: towersTable, towersUserProfiles })
    } catch (error) {
      handleSocketError(socket, error, "Error creating table")
    }
  })

  socket.on("table:delete", async ({ roomId, tableId }) => {
    try {
      await deleteTable(roomId, tableId, io)
    } catch (error) {
      handleSocketError(socket, error, "Error deleting table")
    }
  })

  socket.on(
    "table:send-message",
    async ({ roomId, tableId, message, messageVariables, type = TableChatMessageType.CHAT }) => {
      try {
        const session: Session = getSession(socket)

        if (!session?.userProfileIds?.towers) {
          throw new Error("Towers user profile ID is missing.")
        }

        const chatMessage: TowersTableChatMessage = await prisma.towersTableChatMessage.create({
          data: {
            tableId,
            userProfileId: session.userProfileIds.towers,
            message,
            messageVariables,
            type,
          },
          include: {
            userProfile: {
              include: {
                user: true,
              },
            },
          },
        })

        await setUserLastActiveAt(session?.user.id)

        io.to(tableId).emit("table:message-sent", { roomId, tableId, chatMessage })
      } catch (error) {
        console.error(`Error sending message in table ${tableId}. Error description:`, error)

        // FIXME: Manage errors for specific user in a specific room
        // if (axios.isAxiosError(error) && error.response) {
        //   socket.to(socket.id).emit("[server] error", error.response.data.message || "An error occurred while sending the message.")
        // } else if (error instanceof Error) {
        //   socket.to(socket.id).emit("[server] error", error.message || "An unexpected error occurred.")
        // } else {
        //   socket.to(socket.id).emit("[server] error", "An unexpected error occurred.")
        // }
      }
    },
  )
}

const getSession = (socket: Socket): Session => {
  const session: Session | null = socket.data.session
  if (!session) throw new Error("Session not found. Please log in to continue.")
  return session
}

const handleSocketError = (socket: Socket, error: unknown, customMessage: string): void => {
  console.error(`${customMessage}:`, error)

  if (error instanceof Error) {
    socket.emit("error", { message: error.message || customMessage })
  } else {
    socket.emit("error", { message: customMessage })
  }
}

const leaveTable = async (
  roomId: string,
  tableId: string,
  session: Session,
  socket: Socket,
  io: Server,
): Promise<void> => {
  if (!session?.userProfileIds?.towers) {
    throw new Error("Towers user profile ID is missing.")
  }

  const userCount: number = await prisma.towersUserTable.count({ where: { roomId, tableId } })
  const isLastUser: boolean = userCount === 1

  await prisma.towersUserTable.delete({
    where: { userProfileId_tableId: { userProfileId: session.userProfileIds.towers, tableId } },
  })

  setUserLastActiveAt(session.user.id)

  if (isLastUser) {
    await deleteTable(roomId, tableId, io)
  } else {
    io.to(tableId).emit("table:left", { roomId, tableId, user: session.user })
  }

  socket.leave(tableId)
  io.to(socket.id).emit("table:deleted-self", { tableId })
}

const deleteTable = async (roomId: string, tableId: string, io: Server): Promise<void> => {
  await prisma.towersTable.delete({ where: { id: tableId } })
  io.to(roomId).emit("table:deleted", { roomId, tableId })
}
