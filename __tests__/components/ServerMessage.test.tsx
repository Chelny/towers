import { act } from "react"
import { render, screen } from "@testing-library/react"
import { mockSocketRoom1Id, mockSocketState, mockStoreReducers } from "@/__mocks__/data/socketState"
import { mockAuthenticatedSession, mockUnauthenticatedSession } from "@/__mocks__/data/users"
import ServerMessage from "@/components/game/ServerMessage"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn(),
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
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)

    const { container } = render(<ServerMessage roomId={mockSocketRoom1Id} />)
    expect(container.firstChild).toBeNull()
  })

  it("should render \"You are not logged in\" when unauthenticated and connected", () => {
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
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

    expect(screen.getByText("You are not logged in")).toBeInTheDocument()
  })

  it("should render user connected message when authenticated and connected", () => {
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)

    render(<ServerMessage roomId={mockSocketRoom1Id} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(
      screen.getByText(`Connected to the game as ${mockAuthenticatedSession.data?.user.username}`),
    ).toBeInTheDocument()
  })

  it("should render \"Disconnected from server\" when not connected", () => {
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: RootState) => unknown) => {
      const mockState = mockStoreReducers
      return selectorFn(mockState)
    })

    render(<ServerMessage roomId={mockSocketRoom1Id} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText("Disconnected from server")).toBeInTheDocument()
  })

  it("should render error message when errorMessage exists", () => {
    const errorMessage: string = "Connection error occurred"

    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
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

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})
