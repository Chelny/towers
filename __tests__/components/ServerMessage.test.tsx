import { act } from "react"
import { render, screen } from "@testing-library/react"
import { mockAuthenticatedSession, mockUnauthenticatedSession } from "@/__mocks__/data/users"
import ServerMessage from "@/components/game/ServerMessage"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppSelector } from "@/lib/hooks"
import { SidebarState } from "@/redux/features/sidebar-slice"
import { SocketState } from "@/redux/features/socket-slice"

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

vi.mock("@/lib/hooks", () => ({
  useAppSelector: vi.fn()
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
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.isConnected")) return false
        if (selectorFn.toString().includes("state.socket.errorMessage")) return undefined
        return undefined
      }
    )

    const { container } = render(<ServerMessage />)
    expect(container.firstChild).toBeNull()
  })

  it("should render \"You are not logged in\" when unauthenticated and connected", () => {
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.isConnected")) return true
        if (selectorFn.toString().includes("state.socket.errorMessage")) return undefined
        return undefined
      }
    )

    render(<ServerMessage />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText("You are not logged in")).toBeInTheDocument()
  })

  it("should render user connected message when authenticated and connected", () => {
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.isConnected")) return true
        if (selectorFn.toString().includes("state.socket.errorMessage")) return undefined
        return undefined
      }
    )

    render(<ServerMessage />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(
      screen.getByText(`Connected to the game as ${mockAuthenticatedSession.data?.user.username}`)
    ).toBeInTheDocument()
  })

  it("should render \"Disconnected from server\" when not connected", () => {
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.isConnected")) return false
        if (selectorFn.toString().includes("state.socket.errorMessage")) return undefined
        return undefined
      }
    )

    render(<ServerMessage />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText("Disconnected from server")).toBeInTheDocument()
  })

  it("should render error message when errorMessage exists", () => {
    const errorMessage: string = "Connection error occurred"

    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.isConnected")) return true
        if (selectorFn.toString().includes("state.socket.errorMessage")) return errorMessage
        return undefined
      }
    )

    render(<ServerMessage />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})
