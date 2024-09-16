"use client"

import { getSession } from "next-auth/react"
import { io, Socket } from "socket.io-client"

export interface SocketInterface {
  socket: Socket
}

class SocketConnection implements SocketInterface {
  private _socket: Socket | undefined

  get socket(): Socket {
    if (!this._socket) {
      throw new Error("Socket is not initialized yet.")
    }
    return this._socket
  }

  public async initialize(): Promise<void> {
    const session = await getSession()

    if (session) {
      this._socket = io({
        auth: {
          session
        }
      })
    } else {
      throw new Error("No session found. Cannot initialize socket.")
    }
  }

  public destroy(): void {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

let socketConnection: SocketConnection | undefined

export class SocketFactory {
  public static async create(): Promise<SocketConnection> {
    if (!socketConnection) {
      socketConnection = new SocketConnection()
      await socketConnection.initialize()
    }

    return socketConnection
  }

  public static destroy(): void {
    if (socketConnection) {
      socketConnection.destroy()
      socketConnection = undefined
    }
  }
}
