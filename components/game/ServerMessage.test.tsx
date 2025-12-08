import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ServerMessage from "@/components/game/ServerMessage";
import { mockSession } from "@/test/data/session";

export const mockUseSocket = vi.fn();

vi.mock("@/context/SocketContext", async () => {
  const actual = await vi.importActual("@/context/SocketContext");
  return {
    ...actual,
    useSocket: () => mockUseSocket(),
  };
});

describe("ServerMessage", () => {
  const mockRoomId: string = "mock-room-1";

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should render \"You are not logged in\" when unauthenticated and connected", async () => {
    mockUseSocket.mockReturnValue({
      socketRef: { current: null },
      isConnected: true,
      session: null,
    });

    render(<ServerMessage />);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    waitFor(() => {
      expect(screen.getByText("You are not logged in")).toBeInTheDocument();
    });
  });

  it("should render user connected message when authenticated and connected", () => {
    render(<ServerMessage />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    waitFor(() => {
      expect(screen.getByText(`Connected to the game as ${mockSession.user.username}`)).toBeInTheDocument();
    });
  });

  it("should render \"Disconnected from server\" when not connected", () => {
    mockUseSocket.mockReturnValue({
      socketRef: { current: null },
      isConnected: false,
      session: mockSession,
    });

    render(<ServerMessage />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    waitFor(() => {
      expect(screen.getByText("Disconnected from server")).toBeInTheDocument();
    });
  });

  it("should render error messages when errorMessage exists", () => {
    const errorMessage: string = "Connection error occurred";

    render(<ServerMessage />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
