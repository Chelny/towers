import next from "next";
import {createServer} from "node:http";
import {Server} from "socket.io";
import axios from 'axios';
import {TableChatMessageType} from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({dev, hostname, port});
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  // io.use((socket, next) => {
  //   const session = socket.handshake.auth.session;

  //   if (session) {
  //     try {
  //       if (new Date(session.expires) < new Date()) {
  //         throw new Error("Expired session")
  //       }

  //       next();
  //     } catch (error) {
  //       console.error(error.message ?? "Invalid token. Disconnecting socket.");
  //       socket.disconnect();
  //     }
  //   } else {
  //     console.log("No token provided. Disconnecting socket.");
  //     socket.disconnect();
  //   }
  // });

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

    socket.on("room:leave", ({room: roomId}) => {
      socket.leave(roomId);
    });

    socket.on('table:join', async ({room: tableId, username}) => {
      socket.join(tableId);

      const message = `*** ${username} joined the table.`
      const response = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
        message,
        type: TableChatMessageType.USER_ACTION
      });

      if (response.status === 201) {
        io.to(tableId).emit("table:send-user-joined-message", {tableId, data: response.data.data});
      }
    });

    socket.on("table:leave", async ({room: tableId, username}) => {
      const message = `*** ${username} left the table.`
      const response = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
        message,
        type: TableChatMessageType.USER_ACTION
      });

      if (response.status === 201) {
        socket.broadcast.to(tableId).emit("table:send-user-left-message", {tableId, data: response.data.data});
        socket.leave(tableId);
      }
    });

    socket.on("room:send-message", async ({roomId, towersUserId, message}) => {
      const response = await axios.post(`${process.env.BASE_URL}/api/rooms/${roomId}/chat`, {
        towersUserId,
        message,
      });

      if (response.status === 201) {
        io.to(roomId).emit("room:set-message", {roomId, data: response.data.data});
      }
    });

    socket.on("table:send-message", async ({tableId, towersUserId, message}) => {
      const response = await axios.post(`${process.env.BASE_URL}/api/tables/${tableId}/chat`, {
        towersUserId,
        message,
      });

      if (response.status === 201) {
        io.to(tableId).emit("table:set-message", {tableId, data: response.data.data});
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
      console.log(`> Ready on http://${hostname}:${port}`);
      runScheduler();
    });
});