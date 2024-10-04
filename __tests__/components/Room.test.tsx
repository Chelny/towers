import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import Room from "@/components/game/Room"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch } from "@/lib/hooks"
import { beforeLeaveSocketRoom } from "@/redux/features/socket-slice"
import { leaveRoom, SocketRoomThunk } from "@/redux/thunks/socket-thunks"
import { mockedAuthenticatedSession, mockedRoom1, mockedSocketRoom1Id, mockedUser1 } from "@/vitest.setup"

const { useRouter, mockedRouterPush } = vi.hoisted(() => {
  const mockedRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockedRouterPush }),
    mockedRouterPush
  }
})

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter
  }
})

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn()
}))

vi.mock("@/redux/features/socket-slice")

vi.mock("@/redux/thunks/socket-thunks")

describe("Room Component", () => {
  const mockedAppDispatch: Mock = vi.fn()
  const mockedSocketRoomThunkParams: SocketRoomThunk = {
    roomId: mockedSocketRoom1Id,
    username: mockedUser1.username!
  }

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockedAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room correctly", () => {
    render(<Room roomId={mockedSocketRoom1Id} />)
    expect(screen.getByPlaceholderText("Write something...")).toBeInTheDocument()
  })

  it("should send a message when Enter is pressed", () => {
    render(<Room roomId={mockedSocketRoom1Id} />)

    const input: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(input, { target: { value: "Hello World!" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(mockedAppDispatch).toHaveBeenCalled()
  })

  it("should not navigate to rooms list if room exit fails", async () => {
    const mockedAppDispatchBeforeLeaveSocketRoom: Mock = vi.fn()

    mockedAppDispatch.mockReturnValue({
      unwrap: () => Promise.reject(new Error("Failed to leave room"))
    })

    mockedAppDispatchBeforeLeaveSocketRoom.mockReturnValue({
      unwrap: () => Promise.resolve(mockedSocketRoomThunkParams)
    })

    render(<Room roomId={mockedRoom1.id} />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    await waitFor(() => {
      expect(mockedAppDispatch).toHaveBeenCalledWith(leaveRoom(mockedSocketRoomThunkParams))
      expect(mockedAppDispatchBeforeLeaveSocketRoom).not.toHaveBeenCalledWith(
        beforeLeaveSocketRoom(mockedSocketRoomThunkParams)
      )
      expect(mockedRouterPush).not.toHaveBeenCalled()
    })
  })

  it("should navigate to the rooms list on successful room exit", async () => {
    mockedAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockedSocketRoomThunkParams)
    })

    render(<Room roomId={mockedRoom1.id} />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    expect(mockedAppDispatch).toHaveBeenCalledWith(leaveRoom(mockedSocketRoomThunkParams))
    expect(mockedAppDispatch).toHaveBeenCalledWith(beforeLeaveSocketRoom(mockedSocketRoomThunkParams))

    await waitFor(() => {
      expect(mockedRouterPush).toHaveBeenCalledWith(ROUTE_TOWERS.PATH)
    })
  })
})
