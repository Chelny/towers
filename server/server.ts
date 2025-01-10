import next from "next"
import { createAdapter } from "@socket.io/redis-adapter"
import { createServer, Server as HttpServer } from "http"
import { Redis } from "ioredis"
import os from "os"
import { DisconnectReason, Server as SocketServer } from "socket.io"
import { towersSocket } from "./towers/socket.ts"

const dev: boolean = process.env.NODE_ENV !== "production"
const protocol: string | undefined = process.env.PROTOCOL || "http"
const hostname: string | undefined = process.env.HOSTNAME || "localhost"
const port: number = parseInt(process.env.PORT || "3000", 10)
const app = next({ dev, hostname, port, turbopack: true })
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  const pubClient: Redis = new Redis()
  const subClient: Redis = pubClient.duplicate()

  pubClient.on("error", (error: Error) => {
    console.error(`Redis connection error: ${error}`)
    process.exit(1)
  })

  pubClient.on("ready", () => {
    console.info("Redis connection successful.")
  })

  const httpServer: HttpServer = createServer(handler)
  const io: SocketServer = new SocketServer(httpServer, {
    adapter: createAdapter(pubClient, subClient),
    connectionStateRecovery: {
      // The backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      // Whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
  })

  io.adapter(createAdapter(pubClient, subClient))

  io.use((socket, next) => {
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

    socket.on("disconnecting", async (reason: DisconnectReason) => {
      console.info(`Socket ${socket.id} is disconnecting due to ${reason}.`)
    })

    socket.on("disconnect", (reason: DisconnectReason) => {
      console.info(`Socket ${socket.id} is disconnected from server due to ${reason}.`)
    })

    socket.on("error", (error) => {
      console.error(`Socket error for socket ${socket.id}: ${error.message}.`)

      // if (error && error.message === "unauthorized event") {
      //   socket.emit("socket:disconnect-success")
      //   socket.disconnect()
      // }
    })

    socket.on("socket:disconnect", () => {
      socket.emit("socket:disconnect-success")
      socket.disconnect()
    })

    towersSocket(socket, io)
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

  const getLocalIpAddress = (): string => {
    const interfaces = os.networkInterfaces()

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address
        }
      }
    }

    return "localhost"
  }

  httpServer
    .once("error", (error: Error) => {
      console.error(error)
      process.exit(1)
    })
    .listen(port, () => {
      const localIp: string = getLocalIpAddress()
      console.info(`> Ready on \x1b[34m${protocol}://${hostname}:${port}\x1b[0m`)
      if (dev) console.info(`> Accessible locally at \x1b[34m${protocol}://${localIp}:${port}\x1b[0m`)
      // runScheduler()
    })
})
