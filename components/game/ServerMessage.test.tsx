import { act } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import ServerMessage from "@/components/game/ServerMessage"
import { authClient } from "@/lib/auth-client"
import { mockPendingSession, mockSession } from "@/test/data/session"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

describe("ServerMessage", () => {
  const mockRoomId: string = "mock-room-1"

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("should render \"You are not logged in\" when unauthenticated and connected", async () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockPendingSession)

    render(<ServerMessage roomId={mockRoomId} />)

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.getByText("You are not logged in")).toBeInTheDocument()
    })
  })

  it("should render user connected message when authenticated and connected", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)

    render(<ServerMessage roomId={mockRoomId} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.getByText(`Connected to the game as ${mockSession.data?.user.username}`)).toBeInTheDocument()
    })
  })

  it("should render \"Disconnected from server\" when not connected", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockPendingSession)

    render(<ServerMessage roomId={mockRoomId} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.getByText("Disconnected from server")).toBeInTheDocument()
    })
  })

  it("should render error messages when errorMessage exists", () => {
    const errorMessage: string = "Connection error occurred"

    vi.mocked(authClient.useSession).mockReturnValue(mockPendingSession)

    render(<ServerMessage roomId={mockRoomId} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
})
