import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import Room from "@/components/game/Room"
import { ROUTE_TOWERS } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { leaveRoom } from "@/redux/features/socket-slice"
import { mockRoom1 } from "@/test/data/rooms"
import { mockSession } from "@/test/data/session"
import { mockUseRouter, mockUseSearchParams } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: vi.fn(() => ({
    ...mockUseSearchParams,
    get: vi.fn((key: string) => (key === "room" ? mockRoom1.id : null)),
  })),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe("Room Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room correctly", () => {
    render(<Room />)

    waitFor(() => {
      expect(screen.getByPlaceholderText("Play Now")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Create Table")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Ratings")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Options")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Exit Room")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 1-2")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 3-4")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 5-6")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 7-8")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Who is Watching")).toBeInTheDocument()
    })
  })

  it("should not navigate to rooms list if room exit fails", () => {
    render(<Room />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    waitFor(() => {
      expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoom({ roomId: mockRoom1.id }))
      expect(mockUseRouter).not.toHaveBeenCalled()
    })
  })

  it("should navigate to the rooms list on successful room exit", () => {
    render(<Room />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoom({ roomId: mockRoom1.id }))

    waitFor(() => {
      expect(mockUseRouter).toHaveBeenCalledWith(ROUTE_TOWERS.PATH)
    })
  })
})
