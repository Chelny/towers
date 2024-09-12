import { fireEvent, render, screen } from "@testing-library/react"
import { useDispatch, useSelector } from "react-redux"
import { Mock } from "vitest"
import Room from "@/components/Room"
import { ROUTE_ROOMS } from "@/constants"
import { useSessionData } from "@/hooks/useSessionData"
import { SocketState } from "@/redux/features"
import { mockedAuthenticatedSession, mockedRoom1, mockedSocketStateRooms } from "@/vitest.setup"

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

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn()
}))

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("Room Component", () => {
  const mockedDispatch: Mock = vi.fn()
  const mockedSocketState: Partial<SocketState> = {
    socketRooms: {},
    rooms: mockedSocketStateRooms,
    roomsLoading: false,
    roomsChat: {},
    roomsChatLoading: false,
    roomsUsers: {},
    roomsUsersLoading: false,
    error: ""
  }

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockedDispatch)
    vi.mocked(useSelector).mockReturnValue(mockedSocketState)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room correctly", () => {
    render(<Room roomId={mockedRoom1.id} />)

    expect(screen.getByPlaceholderText("Write something...")).toBeInTheDocument()
  })

  it("should send a message when Enter is pressed", () => {
    render(<Room roomId={mockedRoom1.id} />)

    const input: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(input, { target: { value: "Hello World!" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(mockedDispatch).toHaveBeenCalled()
  })

  it("should navigate to rooms list on exit", () => {
    render(<Room roomId={mockedRoom1.id} />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    expect(mockedRouterPush).toHaveBeenCalledWith(ROUTE_ROOMS.PATH)
  })
})
