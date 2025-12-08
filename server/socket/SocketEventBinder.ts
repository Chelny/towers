import { Socket } from "socket.io";

type EventHandler<T> = (data: T) => void;

interface Listener {
  event: string
  handler: unknown
}

export class SocketEventBinder {
  constructor(private socket: Socket) {}

  private listeners: Listener[] = [];

  public bind<T>(event: string, handler: EventHandler<T>): void {
    this.listeners.push({ event, handler });
    this.socket.on(event, handler);
  }

  public unbindAll<T>(): void {
    for (const { event, handler } of this.listeners) {
      this.socket.off(event, handler as (...args: T[]) => void);
    }

    this.listeners = [];
  }
}
