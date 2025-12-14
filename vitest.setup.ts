import "@testing-library/jest-dom";
import { mockUseRouter, mockUseSearchParams } from "@/test/mocks/router";
import { mockSession } from "@/test/mocks/session";
import { mockSocket } from "@/test/mocks/socket";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: vi.fn(() => mockUseSearchParams),
}));

vi.mock("pino", () => ({
  default: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/context/SocketContext", async () => {
  const actual = await vi.importActual("@/context/SocketContext");
  return {
    ...actual,
    useSocket: () => ({ socketRef: mockSocket, isConnected: true, session: mockSession }),
  };
});

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
});
