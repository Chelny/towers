import { Server as IoServer } from "socket.io";

let io: IoServer | null = null;

export const setIo = (server: IoServer): void => {
  io = server;
};

export const getIo = (): IoServer => {
  if (!io) throw new Error("Socket.io has not been initialized yet.");
  return io;
};
