import next from "next";
import {createServer} from "node:http";
import {Server} from "socket.io";
import axios from "axios";
import os from "os";
import {TableChatMessageType} from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
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
      next();
    } else {
      console.error("No session found. Disconnecting socket...");
      socket.disconnect();
    }
  });

  io.on("connection", (socket) => {
    console.info(`User connected with socket ID: ${socket.id}.`);

    socket.conn.on("upgrade", (transport) => {
      console.info(`Transport upgraded to ${transport.name}.`);
    });

    socket.on("disconnect", (reason) => {
      console.info(`Disconnected from server due to ${reason}.`);
    });

    socket.on("room:join", ({room: roomId}) => {
      socket.join(roomId);
    });

    socket.on("room:leave", async ({room: roomId, tableIds, username}) => {
      // Loop through each tableId and leave the corresponding socket room
      for (const tableId of tableIds) {
        socket.emit("table:leave-multiple", { roomId, tableId, username });
      }

      socket.leave(roomId);
    });

    socket.on("table:join", async ({room: tableId, username}) => {
      socket.join(tableId);

      try {
        const session = socket.handshake.auth.session;
        const message = `*** ${username} joined the table.`
        const response = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
          session,
          message,
          type: TableChatMessageType.USER_ACTION
        });

        if (response.status === 201) {
          io.to(tableId).emit("table:send-user-joined-message", {tableId, data: response.data.data});
        }
      } catch (error) {
        console.error(`Error sending joining message in table ${tableId}. Error description:`, error);
      }
    });

    socket.on("table:leave", async ({room: tableId, username}) => {
      try {
        const session = socket.handshake.auth.session;
        const message = `*** ${username} left the table.`
        const response = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
          session,
          message,
          type: TableChatMessageType.USER_ACTION
        });

        if (response.status === 201) {
         socket.broadcast.to(tableId).emit("table:send-user-left-message", {tableId, data: response.data.data});
        }
      } catch (error) {
        console.error(`Error sending leaving message in table ${tableId}. Error description:`, error);
      } finally {
        socket.leave(tableId);
      }
    });

    socket.on("room:send-message", async ({roomId, message}) => {
      try {
        const session = socket.handshake.auth.session;
        const response = await axios.post(`${process.env.BASE_URL}/api/rooms/${roomId}/chat`, { session, message });

        if (response.status === 201) {
          io.to(roomId).emit("room:set-message", {roomId, data: response.data.data});
        }
      } catch (error) {
        console.error(`Error sending message in room ${roomId}. Error description:`, error);

        // FIXME: Manage errors for specific user in a specific room
        // if (axios.isAxiosError(error) && error.response) {
        //   socket.emit("err", error.response.data.message || "An error occurred while sending the message.");
        // } else if (error instanceof Error) {
        //   socket.emit("err", error.message || "An unexpected error occurred.");
        // } else {
        //   socket.emit("err", "An unexpected error occurred.");
        // }
      }
    });

    socket.on("table:send-message", async ({tableId, message}) => {
      try {
        const session = socket.handshake.auth.session;
        const response = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, { session, message });

        if (response.status === 201) {
          io.to(tableId).emit("table:set-message", {tableId, data: response.data.data});
        }
      } catch (error) {
        console.error(`Error sending message in table ${tableId}. Error description:`, error);

        // FIXME: Manage errors for specific user in a specific room
        // if (axios.isAxiosError(error) && error.response) {
        //   socket.to(tableId).emit("err", error.response.data.message || "An error occurred while sending the message.");
        // } else if (error instanceof Error) {
        //   socket.to(tableId).emit("err", error.message || "An unexpected error occurred.");
        // } else {
        //   socket.to(tableId).emit("err", "An unexpected error occurred.");
        // }
      }
    });

    socket.on("user:sign-out", () => {
      console.info(`User with socket ID ${socket.id} signed out.`);
      socket.emit("user:sign-out-success");
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