"use client"

import { Session } from "next-auth"
import { io, Socket } from "socket.io-client"

export interface SocketInterface {
  socket: Socket
}

class SocketConnection implements SocketInterface {
  private _socket: Socket | null = null

  get socket(): Socket {
    if (!this._socket) {
      throw new Error("Socket is not initialized.")
    }

    return this._socket
  }

  public async initialize(session: Session | null): Promise<void> {
    if (session) {
      this._socket = io({
        auth: { session },
        reconnectionDelay: 10000,
        reconnectionDelayMax: 10000,
      })
    } else {
      throw new Error("No session found. Cannot initialize socket.")
    }
  }

  public destroy(): void {
    if (this._socket) {
      this._socket.disconnect()
      this._socket = null
    }
  }
}

let socketConnection: SocketConnection | null

export class SocketFactory {
  public static async create(session: Session | null): Promise<SocketConnection> {
    if (!socketConnection) {
      socketConnection = new SocketConnection()
      await socketConnection.initialize(session)
    }

    return socketConnection
  }

  public static destroy(): void {
    if (socketConnection) {
      socketConnection.destroy()
      socketConnection = null
    }
  }
}
