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

    socket.on("[room] join", async ({roomId}) => {
      const session = socket.session;

      try {
        socket.join(roomId);

        const towersUserProfileResponse = await axios.get(`${process.env.BASE_URL}/api/towers-user-profiles/${session.user.id}`)
        socket.broadcast.to(roomId).emit("[room] user joined", {roomId, towersUserProfile: towersUserProfileResponse.data.data});
      } catch (error) {
        console.error(`Error joining the room ${roomId}. Error description:`, error);
      }
    });

    socket.on("[room] leave", async ({roomId, tablesToQuit}) => {
      const session = socket.session;

      try {
        // Loop through each tableId and leave the corresponding socket room
        for (const tableToQuit of tablesToQuit) {
          socket.emit("[room] leave all room tables", { roomId, tableToQuit });
        }

        socket.leave(roomId);
        socket.broadcast.to(roomId).emit("[room] user left", {roomId, userId: session.user.id});
      } catch (error) {
        console.error(`Error leaving the room ${roomId}. Error description:`, error);
      }
    });

    socket.on("[room] send message", async ({roomId, message}) => {
      const session = socket.handshake.auth.session;

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

    // **************************************************
    // * Table Events
    // **************************************************

    socket.on("[table] join", async ({tableId}) => {
      const session = socket.session;

      try {
        socket.join(tableId);

        const towersUserProfileResponse = await axios.get(`${process.env.BASE_URL}/api/towers-user-profiles/${session.user.id}`)
        socket.broadcast.to(tableId).emit("[table] user joined", {tableId, towersUserProfile: towersUserProfileResponse.data.data});

        const username = session.user.username;
        const message = `*** ${username} joined the table.`;
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
          session,
          message,
          type: TableChatMessageType.USER_ACTION
        });

        io.to(tableId).emit("[table] display user joined message", {tableId, message: chatResponse.data.data});
      } catch (error) {
        console.error(`Error joining the table ${tableId}. Error description:`, error);
      }
    });

    socket.on("[table] leave", async ({tableId, isLastUser}) => {
      const session = socket.session;

      try {
        socket.broadcast.to(tableId).emit("[table] user left", {tableId, userId: session.user.id});
        socket.leave(tableId);

        if (!isLastUser) {
          const username = session.user.username;
          const message = `*** ${username} left the table.`;
          const chatResponse = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
            session,
            message,
            type: TableChatMessageType.USER_ACTION
          });

          socket.broadcast.to(tableId).emit("[table] display user left message", {tableId, message: chatResponse.data.data});
        }
      } catch (error) {
         console.error(`Error leaving the table ${tableId}. Error description:`, error);
      }
    });

    socket.on("[table] create", ({roomId, table}) => {
      const session = socket.session;
      io.to(roomId).emit("[table] add for all room users", {roomId, userId: session.user.id, table});
    });

    socket.on("[table] update", ({roomId, tableId, table}) => {
      io.to(roomId).emit("[table] update for all room users", {roomId, tableId, table});
    });

    socket.on("[table] delete", ({roomId, tableId}) => {
      io.to(roomId).emit("[table] remove for all room users", {roomId, tableId});
    });

    socket.on("[table] send message", async ({tableId, message}) => {
      const session = socket.handshake.auth.session;

      try {
        const chatResponse = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {session, message});
        io.to(tableId).emit("[table] receive new chat message", {tableId, message: chatResponse.data.data});
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

    // **************************************************
    // * User Events
    // **************************************************

    socket.on("[user] sign out", () => {
      console.info(`User with socket ID ${socket.id} signed out.`);
      socket.emit("[user] sign out success");
      socket.disconnect();
    });
  });

  io.of("/").adapter.on("create-room", (room) => {
    console.info(`Room ${room} was created`);
  });

  io.of("/").adapter.on("join-room", (room, id) => {
    console.info(`Socket ${id} has joined room ${room}`);
  });

  io.of("/").adapter.on("leave-room", (room, id) => {
    console.info(`Socket ${id} has left room ${room}`);
  });

  io.of("/").adapter.on("delete-room", (room) => {
    console.info(`Room ${room} was deleted`);
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