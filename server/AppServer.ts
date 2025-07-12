import next from "next"
import { createAdapter } from "@socket.io/redis-adapter"
import { createServer, Server as HttpServer } from "http"
import { Redis } from "ioredis"
import os from "os"
import { DisconnectReason, Socket, Server as SocketServer } from "socket.io"
import { SocketEvents } from "@/constants/socket-events"
import { logger } from "@/lib/logger"
import { User } from "@/server/towers/classes/User"
import { rooms } from "@/server/towers/room-store"
import { TowersSocketHandler } from "@/server/towers/TowersSocketHandler"

export class AppServer {
  private readonly dev: boolean = process.env.NODE_ENV !== "production"
  private readonly protocol: string = process.env.PROTOCOL || "http"
  private readonly hostname: string = process.env.HOSTNAME || "localhost"
  private readonly port: number = parseInt(process.env.PORT || "3000", 10)
  private app = next({ dev: this.dev, hostname: this.hostname, port: this.port })
  private handler = this.app.getRequestHandler()
  private httpServer!: HttpServer
  private io!: SocketServer
  private redisPub!: Redis
  private redisSub!: Redis

  public async start(): Promise<void> {
    await this.app.prepare()
    await this.setupRedis()
    this.setupSocketServer()
    this.startHttpServer()
  }

  private async setupRedis(): Promise<void> {
    this.redisPub = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD || undefined,
    })
    this.redisSub = this.redisPub.duplicate()

    this.redisPub.on("ready", (): void => {
      logger.info("Redis connection successful.")
    })

    this.redisPub.on("error", (error: Error): void => {
      logger.error(`Redis connection error: ${error}`)
      process.exit(1)
    })

    process.on("SIGINT", async (): Promise<void> => {
      await this.redisPub.quit()
      await this.redisSub.quit()
      process.exit(0)
    })
  }

  private setupSocketServer(): void {
    this.httpServer = createServer(this.handler)

    this.io = new SocketServer(this.httpServer, {
      adapter: createAdapter(this.redisPub, this.redisSub),
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true,
      },
      cors: {
        credentials: true,
        origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
      },
    })

    this.io.use((socket, next) => {
      const session = socket.handshake.auth.session

      if (!session?.user) {
        logger.warn(`Socket ${socket.id} has no valid session during connect. Allowing connection for recovery.`)
        return next()
      }

      socket.data.session = session
      next()
    })

    this.io.on("connection", this.handleConnection.bind(this))

    // Debug room lifecycle
    this.io.of("/").adapter.on("create-room", (room) => logger.info(`Room ${room} created`))
    this.io.of("/").adapter.on("join-room", (room, id) => logger.info(`Socket ${id} joined ${room}`))
    this.io.of("/").adapter.on("leave-room", (room, id) => logger.info(`Socket ${id} left ${room}`))
    this.io.of("/").adapter.on("delete-room", (room) => logger.info(`Room ${room} deleted`))
  }

  private async handleConnection(socket: Socket): Promise<void> {
    const { user: sessionUser } = socket.data.session ?? {}

    if (!sessionUser) {
      logger.warn("Connection attempt without valid session")
      socket.disconnect(true)
      return
    }

    logger.info(`Socket connected: ${socket.id}`)

    const user: User = new User(this.io, socket, sessionUser)

    if (socket.recovered) {
      logger.debug("Client recovered session successfully")
      // Optional: re-join rooms or restore game/table state
      // You may store previously joined room/table info in Redis manually
      // and recover it here, re-calling .join(roomId)
    } else {
      // First connection, or too late to recover
      // Normal user setup
      logger.debug("First connection, or too late to recover")
    }

    // **************************************************
    // * Socket IO Events
    // **************************************************

    socket.conn.on("upgrade", (transport) => {
      logger.info(`Transport upgraded to ${transport.name}`)
    })

    // socket.conn.on("packetCreate", ({ type, data }) => {
    //   if (typeof data !== "undefined") {
    //     logger.info(`Created packet of type: ${type} with data: ${JSON.stringify(data)}.`)
    //   }
    // })

    // socket.conn.on("packet", ({ type, data }) => {
    //   if (typeof data !== "undefined") {
    //     logger.info(`Received packet of type: ${type} with data: ${JSON.stringify(data)}.`)
    //   }
    // })

    // socket.conn.on("drain", () => {
    //   logger.info(`Write buffer drained for socket ${socket.id}.`)
    // })

    socket.conn.on("close", (reason) => {
      logger.info(`Socket ${socket.id} connection closed due to ${reason}.`)
    })

    socket.on("disconnecting", (reason: DisconnectReason) => {
      logger.info(`Socket ${socket.id} disconnecting due to ${reason}.`)
    })

    socket.on("disconnect", async (reason: DisconnectReason) => {
      logger.info(`Socket ${socket.id} disconnected due to ${reason}.`)
    })

    socket.on("error", (error: Error) => {
      logger.error(`Socket error: ${error.message}`)

      if (error && error.message === "unauthorized event") {
        socket.emit("socket:disconnect:success")
        socket.disconnect()
      }
    })

    socket.on("socket:disconnect", () => {
      socket.emit("socket:disconnect:success")
      socket.disconnect()
    })

    // **************************************************
    // * Towers Events
    // **************************************************

    const towersHandler: TowersSocketHandler = new TowersSocketHandler(this.io, socket, user)
    towersHandler.registerSocketListeners()

    socket.on(SocketEvents.ROOMS_GET, () => {
      socket.emit(SocketEvents.ROOMS_LIST, {
        rooms: Array.from(rooms.values()).map((room) => room.toPlainObject(user)),
      })
    })
  }

  private startHttpServer(): void {
    this.httpServer
      .once("error", (error: Error) => {
        logger.error(`Server error: ${error}`)
        process.exit(1)
      })
      .listen(this.port, () => {
        const localIp: string = this.getLocalIpAddress()

        logger.info(`🌍 Ready at ${this.protocol}://${this.hostname}:${this.port}`)
        logger.debug(`🏠 Local access: ${this.protocol}://${localIp}:${this.port}`)

        // this.runScheduler()
      })
  }

  private getLocalIpAddress(): string {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address
        }
      }
    }
    return "localhost"
  }

  // private async runScheduler(): Promise<void> {
  //   try {
  //     await axios.post(
  //       `${process.env.BASE_URL}/api/services/scheduler`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     )
  //   } catch (error) {
  //     logger.error(error)
  //   }
  // }
}
