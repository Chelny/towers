import "@testing-library/jest-dom"
import { screen } from "@testing-library/react"
import { mockSession } from "@/test/data/session"
import { mockSocket } from "@/test/data/socket"
import { getAllByNormalizedText, getByNormalizedText } from "@/test/utils/getByNormalizedText"

vi.mock("pino", () => ({
  default: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

vi.mock("@/context/SocketContext", async () => {
  const actual = await vi.importActual("@/context/SocketContext")
  return {
    ...actual,
    useSocket: () => ({ socketRef: mockSocket, isConnected: true, session: mockSession }),
  }
})

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(), // Legacy
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

export const mockUseRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}

export const mockUseSearchParams = {
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  toString: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  entries: vi.fn(),
  forEach: vi.fn(),
  append: vi.fn(),
  delete: vi.fn(),
  set: vi.fn(),
  sort: vi.fn(),
  [Symbol.iterator]: vi.fn(),
}

export const mockFetch = (global.fetch = vi.fn())

export const mockFetchResponse = (data: ApiResponse) => {
  return {
    json: () => new Promise((resolve: (value: unknown) => void) => resolve(data)),
  }
}

export const customScreen = {
  ...screen,
  getByNormalizedText,
  getAllByNormalizedText,
}
