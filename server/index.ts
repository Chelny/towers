import next from "next";
import { createAdapter } from "@socket.io/redis-adapter";
import { createServer, Server as HttpServer } from "http";
import { Redis } from "ioredis";
import os from "os";
import { DisconnectReason, ExtendedError, Server as IoServer, Socket } from "socket.io";
import { SocketEvents } from "@/constants/socket-events";
import { Session } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { initRedisPublisher } from "@/server/redis/publish";
import { setIo } from "@/server/socket/io";
import { clientEvents } from "@/server/towers/events/clientEvents";
import { serverEvents } from "@/server/towers/events/serverEvents";
import { serverState } from "@/server/towers/models/ServerState";

const dev: boolean = process.env.NODE_ENV !== "production";
const protocol: string = process.env.PROTOCOL || "http";
const hostname: string = process.env.HOSTNAME || "localhost";
const port: number = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let httpServer: HttpServer;
let io: IoServer;
let redisPub: Redis;
let redisSub: Redis;

// **************************************************
// * Start
// **************************************************

export async function start(): Promise<void> {
  await app.prepare();
  await setupRedis();
  setupIoServer();
  startHttpServer();
}

// **************************************************
// * Redis
// **************************************************

async function setupRedis(): Promise<void> {
  redisPub = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisSub = redisPub.duplicate();

  initRedisPublisher(redisPub);

  redisPub.on("ready", (): void => {
    logger.info("Redis connection successful.");

    if (io) {
      serverEvents(redisSub, io);
    } else {
      logger.warn("Socket.IO server not yet initialized — delaying serverEvents setup.");
    }
  });

  redisPub.on("error", (error: Error): void => {
    logger.error(`Redis connection error: ${error}`);
    process.exit(1);
  });

  process.on("SIGINT", async (): Promise<void> => {
    await redisPub.quit();
    await redisSub.quit();
    process.exit(0);
  });
}

// **************************************************
// * Socket.IO
// **************************************************

async function setupIoServer(): Promise<void> {
  httpServer = createServer(handler);

  io = new IoServer(httpServer, {
    adapter: createAdapter(redisPub, redisSub),
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
    cors: {
      credentials: true,
      origin: process.env.TRUSTED_ORIGINS?.split(";") || [],
    },
  });

  setIo(io);

  io.use((socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
    const session = socket.handshake.auth.session;

    if (!session?.user) {
      logger.warn(`Socket ${socket.id} has no valid session during connect. Allowing connection for recovery.`);
      return next();
    }

    socket.data.session = session;
    next();
  });

  io.on("connection", handleConnection);

  // Debug room lifecycle
  io.of("/").adapter.on("create-room", (room) => logger.info(`Socket room ${room} created`));
  io.of("/").adapter.on("join-room", (room, id) => logger.info(`Socket ${id} joined ${room}`));
  io.of("/").adapter.on("leave-room", (room, id) => logger.info(`Socket ${id} left ${room}`));
  io.of("/").adapter.on("delete-room", (room) => logger.info(`Socket room ${room} deleted`));
}

async function handleConnection(socket: Socket): Promise<void> {
  const { user: sessionUser } = socket.data.session as Session;

  if (!sessionUser) {
    logger.warn("Connection attempt without valid session");
    socket.disconnect(true);
    return;
  }

  const userId: string = sessionUser.id;
  const username: string = sessionUser.username;
  logger.info(`Socket connected: ${socket.id} for ${username} (${userId})`);

  serverState.handlePlayerConnect(socket, userId, username);

  // **************************************************
  // * Socket Recovery
  // **************************************************

  if (socket.recovered) {
    logger.debug("Client recovered session successfully");
  } else {
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

  socket.on("disconnect", (reason: DisconnectReason) => {
    logger.info(`Socket ${socket.id} disconnected due to ${reason}.`);
    serverState.handlePlayerDisconnect(socket, userId);
  });

  socket.on("error", (error: Error) => {
    logger.error(`Socket error: ${error.message}`);
  });

  socket.on(SocketEvents.SIGN_OUT, () => {
    serverState.handlePlayerSignOut(socket, userId);
  });

  // **************************************************
  // * Custom Events
  // **************************************************

  clientEvents(io, socket);
}

// **************************************************
// * HTTP Server
// **************************************************

function startHttpServer(): void {
  httpServer
    .once("error", (error: Error) => {
      logger.error(`Server error: ${error}`);
      process.exit(1);
    })
    .listen(port, () => {
      const localIp: string = getLocalIpAddress();

      logger.info(`🌍 Ready at ${protocol}://${hostname}:${port}`);
      logger.debug(`🏠 Local access: ${protocol}://${localIp}:${port}`);

      // runScheduler();
    });
}

function getLocalIpAddress(): string {
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

// **************************************************
// * Scheduler
// **************************************************

// async function runScheduler(): Promise<void> {
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

start().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
