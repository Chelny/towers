import next from "next";
import {createServer} from "node:http";
import {Server} from "socket.io";
import axios from "axios";
import os from "os";
import {TableChatMessageType} from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME;
const port = 3000;
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();

const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "localhost";
};

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.use((socket, next) => {
    const session = socket.handshake.auth.session;

    if (session) {
      socket.session = session;
      socket.id = session.user.id;
      next();
    } else {
      console.error("No session found. Disconnecting socket...");
      socket.disconnect();
    }
  });

  io.on("connection", (socket) => {
    console.info(`User connected with socket ID: ${socket.id}.`);

    // **************************************************
    // * Socket IO Events
    // **************************************************

    socket.conn.on("upgrade", (transport) => {
      console.info(`Transport upgraded to ${transport.name}.`);
    });

    socket.on("disconnect", (reason) => {
      console.info(`Disconnected from server due to ${reason}.`);
    });

    // **************************************************
    // * Room Events
    // **************************************************

    socket.on("[room] join", async ({roomId, towersUserRoomTable}) => {
      try {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("[room] user joined", {roomId, towersUserRoomTable});
      } catch (error) {
        console.error(`Error joining the room ${roomId}. Error description:`, error);
      }
    });

    socket.on("[room] leave", async ({roomId, tablesToQuit}) => {
      const session = socket.session;

      try {
        // Loop through each tableId and leave the corresponding socket room
        for (const tableToQuit of tablesToQuit) {
          socket.emit("[room] leave all room tables", { roomId, tableId: tableToQuit.id });

          if (tableToQuit.isLastUser) {
            socket.broadcast.to(roomId).emit("[room] remove table for room users", {roomId, tableId: tableToQuit.id});
          }
        }

        socket.leave(roomId);
        socket.broadcast.to(roomId).emit("[room] user left", {roomId, userId: session.user.id});
      } catch (error) {
        console.error(`Error leaving the room ${roomId}. Error description:`, error);
      }
    });

    socket.on("[room] send message", async ({roomId, message}) => {
      const session = socket.session;

      try {
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/rooms/${roomId}/chat`, {session, message});
        io.to(roomId).emit("[room] receive new chat message", {roomId, message: chatResponse.data.data});
      } catch (error) {
        console.error(`Error sending message in room ${roomId}. Error description:`, error);

        // FIXME: Manage errors for specific user in a specific room
        // if (axios.isAxiosError(error) && error.response) {
        //   socket.emit("[server] error", error.response.data.message || "An error occurred while sending the message.");
        // } else if (error instanceof Error) {
        //   socket.emit("[server] error", error.message || "An unexpected error occurred.");
        // } else {
        //   socket.emit("[server] error", "An unexpected error occurred.");
        // }
      }
    });

    socket.on("[room] update users", ({roomId, users}) => {
      io.to(roomId).emit("[room] update users for room users", {roomId, users});
    });

    // **************************************************
    // * Table Events
    // **************************************************

    socket.on("[table] join", async ({roomId, tableId, towersUserRoomTable}) => {
      try {
        socket.join(tableId);
        socket.broadcast.to(tableId).emit("[table] user joined", {roomId, tableId, towersUserRoomTable});
      } catch (error) {
        console.error(`Error joining the table ${tableId}. Error description:`, error);
      }
    });

    socket.on("[table] leave", async ({roomId, tableId}) => {
      const session = socket.session;

      try {
        socket.broadcast.to(tableId).emit("[table] user left", {roomId, tableId, user: session.user});
        socket.leave(tableId);
      } catch (error) {
        console.error(`Error leaving the table ${tableId}. Error description:`, error);
      }
    });

    socket.on("[table] create", ({roomId, info}) => {
      io.to(roomId).emit("[room] add table for room users", {roomId, info});
    });

    socket.on("[table] update", ({roomId, tableId, info, users}) => {
      io.to(roomId).emit("[room] update table for room users", {roomId, tableId, info, users});
    });

    socket.on("[table] delete", ({roomId, tableId}) => {
      io.to(roomId).emit("[room] remove table for room users", {roomId, tableId});
    });

    socket.on("[table] send message", async ({roomId, tableId, message}) => {
      const session = socket.session;

      try {
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {session, message});
        io.to(tableId).emit("[table] receive new chat message", {roomId, tableId, message: chatResponse.data.data});
      } catch (error) {
        console.error(`Error sending message in table ${tableId}. Error description:`, error);

        // FIXME: Manage errors for specific user in a specific room
        // if (axios.isAxiosError(error) && error.response) {
        //   socket.to(tableId).emit("[server] error", error.response.data.message || "An error occurred while sending the message.");
        // } else if (error instanceof Error) {
        //   socket.to(tableId).emit("[server] error", error.message || "An unexpected error occurred.");
        // } else {
        //   socket.to(tableId).emit("[server] error", "An unexpected error occurred.");
        // }
      }
    });

    socket.on("[table] send automated message", async ({roomId, tableId, message, type, privateToUserId}) => {
      const session = socket.session;

      if (type !== TableChatMessageType.HERO_CODE) {
        message = `*** ${message}`
      }

      try {
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
          session,
          message,
          type,
          privateToUserId
        });

        io.to(tableId).emit("[table] receive new chat message", {roomId, tableId, message: chatResponse.data.data});
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          socket.to(socket.id).emit("[server] error", error.response.data.message || "An error occurred while sending the message.");
        } else if (error instanceof Error) {
          socket.to(socket.id).emit("[server] error", error.message || "An unexpected error occurred.");
        } else {
          socket.to(socket.id).emit("[server] error", "An unexpected error occurred.");
        }
      }
    });

    // **************************************************
    // * User Events
    // **************************************************

    socket.on("[user] sign out", () => {
      socket.emit("[user] sign out success");
      socket.disconnect(true);
      console.info(`Socket ${socket.id} signed out.`);
    });
  });

  io.of("/").adapter.on("create-room", (room) => {
    console.info(`Room ${room} was created.`);
  });

  io.of("/").adapter.on("join-room", (room, id) => {
    console.info(`Socket ${id} has joined room ${room}.`);
  });

  io.of("/").adapter.on("leave-room", (room, id) => {
    console.info(`Socket ${id} has left room ${room}.`);
  });

  io.of("/").adapter.on("delete-room", (room) => {
    console.info(`Room ${room} was deleted.`);
  });

  // Scheduler
  const runScheduler = async () => {
    try {
      await axios.post(
        `${process.env.BASE_URL}/api/services/scheduler`,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

  httpServer
    .once("error", (error) => {
      console.error(error);
      process.exit(1);
    })
    .listen(port, () => {
      const localIp = getLocalIpAddress();
      console.log(`> Ready on \x1b[34mhttp://${hostname}:${port}\x1b[0m`);
      if (dev) console.log(`> Accessible locally at \x1b[34mhttp://${localIp}:${port}\x1b[0m`);
      runScheduler();
    });
});