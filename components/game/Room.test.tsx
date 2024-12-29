import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import Room from "@/components/game/Room"
import { ROUTE_TOWERS } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { leaveRoomSocketRoom } from "@/redux/features/socket-slice"
import { leaveRoom } from "@/redux/thunks/room-thunks"
import { mockRoom1 } from "@/test/data/rooms"
import { mockSocketRoom1Id } from "@/test/data/socketState"
import { mockSession } from "@/test/data/users"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
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

vi.mock("@/redux/features/socket-slice")

vi.mock("@/redux/thunks/room-thunks")

describe("Room Component", () => {
  const mockAppDispatch: Mock = vi.fn()
  const mockSocketRoomThunkParams: { roomId: string; tablesToQuit: { id: string; isLastUser: boolean }[] } = {
    roomId: mockSocketRoom1Id,
    tablesToQuit: [],
  }

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room correctly", () => {
    render(<Room roomId={mockSocketRoom1Id} />)
    expect(screen.getByPlaceholderText("Write something...")).toBeInTheDocument()
  })

  it("should send a message when Enter is pressed", () => {
    render(<Room roomId={mockSocketRoom1Id} />)

    const input: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(input, { target: { value: "Hello World!" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(mockAppDispatch).toHaveBeenCalled()
  })

  it("should not navigate to rooms list if room exit fails", () => {
    const mockAppDispatchBeforeLeaveSocketRoom: Mock = vi.fn()

    mockAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(),
    })

    mockAppDispatchBeforeLeaveSocketRoom.mockReturnValue({
      unwrap: () => Promise.resolve(mockSocketRoomThunkParams),
    })

    render(<Room roomId={mockRoom1.id} />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    waitFor(() => {
      expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoom(mockSocketRoomThunkParams))
      expect(mockAppDispatchBeforeLeaveSocketRoom).not.toHaveBeenCalledWith(
        leaveRoomSocketRoom(mockSocketRoomThunkParams),
      )
      expect(mockUseRouter).not.toHaveBeenCalled()
    })
  })

  it("should navigate to the rooms list on successful room exit", () => {
    mockAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockSocketRoomThunkParams),
    })

    render(<Room roomId={mockRoom1.id} />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoom(mockSocketRoomThunkParams))
    expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoomSocketRoom(mockSocketRoomThunkParams))

    waitFor(() => {
      expect(mockUseRouter).toHaveBeenCalledWith(ROUTE_TOWERS.PATH)
    })
  })
})
