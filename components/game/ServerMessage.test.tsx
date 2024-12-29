import { act } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import ServerMessage from "@/components/game/ServerMessage"
import { authClient } from "@/lib/auth-client"
import { useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"
import { mockSocketRoom1Id, mockSocketState, mockStoreReducers } from "@/test/data/socketState"
import { mockPendingSession, mockSession } from "@/test/data/users"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppSelector: vi.fn(),
}))

describe("ServerMessage Component", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("should render nothing when not initialized", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockPendingSession)

    const { container } = render(<ServerMessage roomId={mockSocketRoom1Id} />)
    expect(container.firstChild).toBeNull()
  })

  it("should render \"You are not logged in\" when unauthenticated and connected", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockPendingSession)
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: RootState) => unknown) => {
      const mockState = {
        ...mockStoreReducers,
        socket: mockSocketState,
      }

      return selectorFn(mockState)
    })

    render(<ServerMessage roomId={mockSocketRoom1Id} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.getByText("You are not logged in")).toBeInTheDocument()
    })
  })

  it("should render user connected message when authenticated and connected", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)

    render(<ServerMessage roomId={mockSocketRoom1Id} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.getByText(`Connected to the game as ${mockSession.data?.user.username}`)).toBeInTheDocument()
    })
  })

  it("should render \"Disconnected from server\" when not connected", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockPendingSession)
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: RootState) => unknown) => {
      const mockState = mockStoreReducers
      return selectorFn(mockState)
    })

    render(<ServerMessage roomId={mockSocketRoom1Id} />)

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
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: RootState) => unknown) => {
      const mockState = {
        ...mockStoreReducers,
        socket: {
          ...mockSocketState,
          errorMessage,
        },
      }

      return selectorFn(mockState)
    })

    render(<ServerMessage roomId={mockSocketRoom1Id} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
})
