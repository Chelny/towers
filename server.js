import next from "next";
import {createServer} from "node:http";
import {Server} from "socket.io";
import axios from 'axios';

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

    socket.on("room:join", ({room}) => {
      socket.join(room);
    });

    // socket.on("create-table", ({room}) => {
    //   console.log("create table", room)
    //   socket.to(room).emit("get-tables", {room});
    // });

    // socket.on("delete-table", ({room}) => {
    //   console.log("delete table", room)
    //   socket.to(room).emit("get-tables", {room});
    // });

    socket.on("room:leave", ({room}) => {
      socket.leave(room);
    });

    socket.on('table:join', ({room, username}) => {
      socket.join(room);
      socket.broadcast.to(room).emit("table:user-joined-announcement", {tableId: room, username});
    });

    socket.on("table:before-leave", ({room, username}) => {
      io.to(room).emit("table:user-left-announcement", {tableId: room, username});
    });

    socket.on("table:leave", ({room}) => {
      socket.leave(room);
    });

    socket.on("room:send-message", ({roomId, towersUserId, message}) => {
      io.to(roomId).emit("room:get-message", {roomId, towersUserId, message});
    });

    socket.on("table:send-message", ({tableId, towersUserId, message}) => {
      io.to(tableId).emit("table:get-message", {tableId, towersUserId, message});
    });

    socket.on("sign-out", () => {
      console.info(`User with socket ID ${socket.id} signed out.`);
      socket.emit("sign-out-success");
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
        `http://${hostname}:${port}/api/services/scheduler`,
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