import next from "next";
import { createAdapter } from "@socket.io/redis-adapter";
import { createServer, Server as HttpServer } from "http";
import { Redis } from "ioredis";
import os from "os";
import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { logger } from "@/lib/logger";
import { initRedisPublisher } from "@/server/redis/publish";
import { User } from "@/server/towers/classes/User";
import { serverToClientEvents } from "@/server/towers/events/server-to-client";
import { RoomManager } from "@/server/towers/managers/RoomManager";
import { UserManager } from "@/server/towers/managers/UserManager";
import { TowersSocketHandler } from "@/server/towers/TowersSocketHandler";

class AppServer {
  private readonly dev: boolean = process.env.NODE_ENV !== "production";
  private readonly protocol: string = process.env.PROTOCOL || "http";
  private readonly hostname: string = process.env.HOSTNAME || "localhost";
  private readonly port: number = parseInt(process.env.PORT || "3000", 10);
  private app = next({ dev: this.dev, hostname: this.hostname, port: this.port });
  private handler = this.app.getRequestHandler();
  private httpServer!: HttpServer;
  private io!: SocketServer;
  private redisPub!: Redis;
  private redisSub!: Redis;

  public async start(): Promise<void> {
    await this.app.prepare();
    await this.loadGameRooms();
    await this.setupRedis();
    this.setupIoServer();
    this.startHttpServer();
  }

  private async loadGameRooms(): Promise<void> {
    await RoomManager.loadRoomsFromDb();
  }

  private async setupRedis(): Promise<void> {
    this.redisPub = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.redisSub = this.redisPub.duplicate();

    initRedisPublisher(this.redisPub);

    this.redisPub.on("ready", (): void => {
      logger.info("Redis connection successful.");

      if (this.io) {
        serverToClientEvents(this.redisSub, this.io);
      } else {
        logger.warn("Socket.IO server not yet initialized — delaying serverEvents setup.");
      }
    });

    this.redisPub.on("error", (error: Error): void => {
      logger.error(`Redis connection error: ${error}`);
      process.exit(1);
    });

    process.on("SIGINT", async (): Promise<void> => {
      await this.redisPub.quit();
      await this.redisSub.quit();
      process.exit(0);
    });
  }

  private setupIoServer(): void {
    this.httpServer = createServer(this.handler);

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
    });

    this.io.use((socket, next) => {
      const session = socket.handshake.auth.session;

      if (!session?.user) {
        logger.warn(`Socket ${socket.id} has no valid session during connect. Allowing connection for recovery.`);
        return next();
      }

      socket.data.session = session;
      next();
    });

    this.io.on("connection", this.handleConnection.bind(this));

    // Debug room lifecycle
    this.io.of("/").adapter.on("create-room", (room) => logger.info(`Room ${room} created`));
    this.io.of("/").adapter.on("join-room", (room, id) => logger.info(`Socket ${id} joined ${room}`));
    this.io.of("/").adapter.on("leave-room", (room, id) => logger.info(`Socket ${id} left ${room}`));
    this.io.of("/").adapter.on("delete-room", (room) => logger.info(`Room ${room} deleted`));
  }

  private async handleConnection(socket: Socket): Promise<void> {
    const { user: sessionUser } = socket.data.session;

    if (!sessionUser) {
      logger.warn("Connection attempt without valid session");
      socket.disconnect(true);
      return;
    }

    const userId: string = sessionUser.id;
    const username: string = sessionUser.username;
    logger.info(`Socket connected: ${socket.id} for ${username} (${userId})`);

    const user: User | null = await UserManager.loadUserFromDb(userId);
    if (!user) {
      socket.disconnect(true);
      return;
    }

    user.socket = socket;
    socket.join(user.id);

    // **************************************************
    // * Socket Recovery
    // **************************************************

    if (socket.recovered) {
      logger.debug("Client recovered session successfully");
      // Optional: re-join rooms or restore game/table state
      // You may store previously joined room/table info in Redis manually
      // and recover it here, re-calling .join(roomId)
    } else {
      // First connection, or too late to recover
      // Normal user setup
      logger.debug("First connection, or too late to recover");
    }

    // **************************************************
    // * Socket IO Events
    // **************************************************

    socket.conn.on("upgrade", (transport) => {
      logger.info(`Transport upgraded to ${transport.name}`);
    });

    socket.conn.on("close", (reason) => {
      logger.info(`Socket ${socket.id} connection closed due to ${reason}.`);
    });

    socket.on("disconnecting", (reason: DisconnectReason) => {
      logger.info(`Socket ${socket.id} disconnecting due to ${reason}.`);
    });

    socket.on("disconnect", async (reason: DisconnectReason) => {
      logger.info(`Socket ${socket.id} disconnected due to ${reason}.`);
      socket.leave(user.id);
    });

    socket.on("error", (error: Error) => {
      logger.error(`Socket error: ${error.message}`);
    });

    socket.on(ClientToServerEvents.SIGN_OUT, () => {
      socket.emit(ServerToClientEvents.SIGN_OUT_SUCCESS);
      socket.disconnect(true);
    });

    // **************************************************
    // * Towers Events
    // **************************************************

    const towersHandler: TowersSocketHandler = new TowersSocketHandler(this.io, socket, user);
    towersHandler.registerSocketListeners();
  }

  private startHttpServer(): void {
    this.httpServer
      .once("error", (error: Error) => {
        logger.error(`Server error: ${error}`);
        process.exit(1);
      })
      .listen(this.port, () => {
        const localIp: string = this.getLocalIpAddress();

        logger.info(`🌍 Ready at ${this.protocol}://${this.hostname}:${this.port}`);
        logger.debug(`🏠 Local access: ${this.protocol}://${localIp}:${this.port}`);

        // this.runScheduler()
      });
  }

  private getLocalIpAddress(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
    return "localhost";
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

const server: AppServer = new AppServer();
server.start();
