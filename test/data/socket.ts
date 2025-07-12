export const mockSocket = {
  current: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    id: "mock-socket-id",
    connected: true,
    disconnected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}
