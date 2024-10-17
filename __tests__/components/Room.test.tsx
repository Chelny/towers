import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { mockRoom1 } from "@/__mocks__/data/rooms"
import { mockSocketRoom1Id } from "@/__mocks__/data/socketState"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import Room from "@/components/game/Room"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch } from "@/lib/hooks"
import { leaveRoomSocketRoom } from "@/redux/features/socket-slice"
import { leaveRoom } from "@/redux/thunks/room-thunks"

const { useRouter, mockRouterPush } = vi.hoisted(() => {
  const mockRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockRouterPush }),
    mockRouterPush,
  }
})

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter,
  }
})

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn(),
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
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
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

  it("should not navigate to rooms list if room exit fails", async () => {
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

    await waitFor(() => {
      expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoom(mockSocketRoomThunkParams))
      expect(mockAppDispatchBeforeLeaveSocketRoom).not.toHaveBeenCalledWith(
        leaveRoomSocketRoom(mockSocketRoomThunkParams)
      )
      expect(mockRouterPush).not.toHaveBeenCalled()
    })
  })

  it("should navigate to the rooms list on successful room exit", async () => {
    mockAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockSocketRoomThunkParams),
    })

    render(<Room roomId={mockRoom1.id} />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoom(mockSocketRoomThunkParams))
    expect(mockAppDispatch).toHaveBeenCalledWith(leaveRoomSocketRoom(mockSocketRoomThunkParams))

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(ROUTE_TOWERS.PATH)
    })
  })
})
