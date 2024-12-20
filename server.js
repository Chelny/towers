import next from "next"
import { TableChatMessageType } from "@prisma/client"
import axios from "axios"
import { createServer } from "node:http"
import os from "os"
import { Server } from "socket.io"

const dev = process.env.NODE_ENV !== "production"
const protocol = process.env.PROTOCOL
const hostname = process.env.HOSTNAME
const port = parseInt(process.env.PORT, 10)
const app = next({ dev, hostname, port, turbopack: true })
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer, {
    connectionStateRecovery: {
      // The backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      // Whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
  })

  io.use(async (socket, next) => {
    const session = socket.handshake.auth.session

    if (session) {
      socket.data.session = session
      next()
    } else {
      next(new Error("Authentication error: No session found."))
    }
  })

  io.on("connection", async (socket) => {
    console.info(`User connected with socket ID: ${socket.id}.`)
    console.info(`Initial transport: ${socket.conn.transport.name}`)

    // if (socket.recovered) {
    //   // Recovery was successful: socket.id, socket.rooms and socket.data were restored
    //   console.log("recovered!", socket)
    //   console.log("socket.rooms:", socket.rooms)
    //   console.log("socket.data:", socket.data)
    // } else {
    //   // New or unrecoverable session
    //   console.log("new or unrecoverable session")
    // }

    // **************************************************
    // * Socket IO Events
    // **************************************************

    socket.conn.on("upgrade", (transport) => {
      console.info(`Transport upgraded to ${transport.name} for socket ${socket.id}.`)
    })

    socket.conn.on("packet", ({ type, data }) => {
      if (typeof data !== "undefined") {
        console.info(`Received packet of type: ${type} with data: ${JSON.stringify(data)}.`)
      }
    })

    socket.conn.on("packetCreate", ({ type, data }) => {
      if (typeof data !== "undefined") {
        console.info(`Created packet of type: ${type} with data: ${JSON.stringify(data)}.`)
      }
    })

    socket.conn.on("drain", () => {
      console.info(`Write buffer drained for socket ${socket.id}.`)
    })

    socket.conn.on("close", (reason) => {
      console.info(`Underlying connection closed for socket ${socket.id} due to ${reason}.`)
    })

    socket.on("disconnecting", async (reason) => {
      console.info(`Socket ${socket.id} is disconnecting due to ${reason}.`)
    })

    socket.on("disconnect", (reason) => {
      console.info(`Socket ${socket.id} is disconnected from server due to ${reason}.`)
    })

    socket.on("error", (error) => {
      console.error(`Socket error for socket ${socket.id}: ${error.message}.`)

      // if (error && error.message === "unauthorized event") {
      //   socket.disconnect()
      // }
    })

    socket.on("[socket] disconnect", () => {
      socket.emit("[socket] disconnect success")
      socket.disconnect()
    })

    // **************************************************
    // * Room Events
    // **************************************************

    socket.on("[room] join", ({ roomId, towersUserRoomTable }) => {
      try {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit("[room] user joined", { roomId, towersUserRoomTable })
      } catch (error) {
        console.error(`Error joining the room ${roomId}. Error description:`, error)
      }
    })

    socket.on("[room] leave", ({ roomId, tablesToQuit }) => {
      const session = socket.data.session

      try {
        // Loop through each tableId and leave the corresponding socket room
        for (const tableToQuit of tablesToQuit) {
          socket.emit("[room] leave all room tables", { roomId, tableId: tableToQuit.id })

          if (tableToQuit.isLastUser) {
            socket.broadcast.to(roomId).emit("[room] remove table for room users", { roomId, tableId: tableToQuit.id })
          }
        }

        socket.leave(roomId)
        socket.broadcast.to(roomId).emit("[room] user left", { roomId, userId: session.user.id })
      } catch (error) {
        console.error(`Error leaving the room ${roomId}. Error description:`, error)
      }
    })

    socket.on("[room] send message", async ({ roomId, message }) => {
      const session = socket.data.session

      try {
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/rooms/${roomId}/chat`, { session, message })
        io.to(roomId).emit("[room] receive new chat message", { roomId, message: chatResponse.data.data })
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

    socket.on("[room] update users", ({ roomId, users }) => {
      io.to(roomId).emit("[room] update users for room users", { roomId, users })
    })

    // **************************************************
    // * Table Events
    // **************************************************

    socket.on("[table] join", ({ roomId, tableId, towersUserRoomTable }) => {
      try {
        socket.join(tableId)
        socket.broadcast.to(tableId).emit("[table] user joined", { roomId, tableId, towersUserRoomTable })
      } catch (error) {
        console.error(`Error joining the table ${tableId}. Error description:`, error)
      }
    })

    socket.on("[table] leave", ({ roomId, tableId }) => {
      const session = socket.data.session

      try {
        socket.leave(tableId)
        socket.broadcast.to(tableId).emit("[table] user left", { roomId, tableId, user: session.user })
      } catch (error) {
        console.error(`Error leaving the table ${tableId}. Error description:`, error)
      }
    })

    socket.on("[table] create", ({ roomId, info }) => {
      io.to(roomId).emit("[room] add table for room users", { roomId, info })
    })

    socket.on("[table] update", ({ roomId, tableId, info, users }) => {
      io.to(roomId).emit("[room] update table for room users", { roomId, tableId, info, users })
    })

    socket.on("[table] delete", ({ roomId, tableId }) => {
      io.to(roomId).emit("[room] remove table for room users", { roomId, tableId })
    })

    socket.on("[table] send message", async ({ roomId, tableId, message }) => {
      const session = socket.data.session

      try {
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, { session, message })
        io.to(tableId).emit("[table] receive new chat message", { roomId, tableId, message: chatResponse.data.data })
      } catch (error) {
        console.error(`Error sending message in table ${tableId}. Error description:`, error)

        // FIXME: Manage errors for specific user in a specific room
        // if (axios.isAxiosError(error) && error.response) {
        //   socket.to(tableId).emit("[server] error", error.response.data.message || "An error occurred while sending the message.");
        // } else if (error instanceof Error) {
        //   socket.to(tableId).emit("[server] error", error.message || "An unexpected error occurred.");
        // } else {
        //   socket.to(tableId).emit("[server] error", "An unexpected error occurred.");
        // }
      }
    })

    socket.on("[table] send automated message", async ({ roomId, tableId, message, type, privateToUserId }) => {
      const session = socket.data.session

      if (type !== TableChatMessageType.HERO_CODE) {
        message = `*** ${message}`
      }

      try {
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
          session,
          message,
          type,
          privateToUserId,
        })

        io.to(tableId).emit("[table] receive new chat message", { roomId, tableId, message: chatResponse.data.data })
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          socket.to(socket.id).emit("[server] error", error.response.data.message || "An error occurred while sending the message.")
        } else if (error instanceof Error) {
          socket.to(socket.id).emit("[server] error", error.message || "An unexpected error occurred.")
        } else {
          socket.to(socket.id).emit("[server] error", "An unexpected error occurred.")
        }
      }
    })
  })

  io.of("/").adapter.on("create-room", (room) => {
    console.info(`Room ${room} was created.`)
  })

  io.of("/").adapter.on("join-room", (room, id) => {
    console.info(`Socket ${id} has joined room ${room}.`)
  })

  io.of("/").adapter.on("leave-room", (room, id) => {
    console.info(`Socket ${id} has left room ${room}.`)
  })

  io.of("/").adapter.on("delete-room", (room) => {
    console.info(`Room ${room} was deleted.`)
  })

  // Scheduler
  // const runScheduler = async () => {
  //   try {
  //     await axios.post(
  //       `${process.env.BASE_URL}/api/services/scheduler`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     )
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces()

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address
        }
      }
    }

    return "localhost"
  }

  httpServer
    .once("error", (error) => {
      console.error(error)
      process.exit(1)
    })
    .listen(port, () => {
      const localIp = getLocalIpAddress()
      console.info(`> Ready on \x1b[34m${protocol}://${hostname}:${port}\x1b[0m`)
      if (dev) console.info(`> Accessible locally at \x1b[34m${protocol}://${localIp}:${port}\x1b[0m`)
      // runScheduler()
    })
})