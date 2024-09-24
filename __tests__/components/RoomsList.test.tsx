import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import RoomsList from "@/components/RoomsList"
import { useSessionData } from "@/hooks/useSessionData"
import { RoomWithCount } from "@/interfaces/room"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { SocketState } from "@/redux/features/socket-slice"
import { SocketRoomThunk } from "@/redux/thunks/socket-thunks"
import { mockedAuthenticatedSession, mockedRoom1, mockedRoom2, mockedSocketRoom1Id, mockedUser1 } from "@/vitest.setup"

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

describe("RoomsList Component", () => {
  const mockedAppDispatch: Mock = vi.fn()
  const mockedSocketRoomThunkParams: SocketRoomThunk = {
    room: mockedSocketRoom1Id,
    isTable: false,
    username: mockedUser1.username!
  }
  const mockedRooms: RoomWithCount[] = [
    {
      ...mockedRoom1,
      _count: { towersGameUsers: 123 }
    },
    {
      ...mockedRoom2,
      _count: { towersGameUsers: 301 }
    }
  ]

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockedAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
    // eslint-disable-next-line no-unused-vars
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: { socket: SocketState }) => unknown) => {
      if (selectorFn.toString().includes("state.socket.isConnected")) {
        return true
      }
      return undefined
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room details correctly", () => {
    render(<RoomsList rooms={mockedRooms} />)

    expect(screen.getByText(mockedRoom1.name)).toBeInTheDocument()
    expect(screen.getByText(mockedRoom1.difficulty)).toBeInTheDocument()
    expect(screen.getByText("123 users")).toBeInTheDocument()
    expect(screen.getByText(mockedRoom2.name)).toBeInTheDocument()
    expect(screen.getByText(mockedRoom2.difficulty)).toBeInTheDocument()
    expect(screen.getByText("301 users")).toBeInTheDocument()

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    expect(buttons.length).toEqual(2)
    buttons.forEach((button: HTMLButtonElement) => expect(button).toBeInTheDocument())
  })

  it("should disable the join button when the room is full", () => {
    render(<RoomsList rooms={mockedRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    expect(buttons[1]).toBeDisabled()
  })

  it("should navigate to the correct room when join button is clicked", async () => {
    mockedAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockedSocketRoomThunkParams)
    })

    render(<RoomsList rooms={mockedRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    fireEvent.click(buttons[0])

    await waitFor(() => {
      expect(mockedRouterPush).toHaveBeenCalledWith(`/towers?room=${mockedSocketRoom1Id}`)
    })
  })

  it("should not trigger navigation when join button is disabled", () => {
    render(<RoomsList rooms={mockedRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    fireEvent.click(buttons[1])

    expect(mockedRouterPush).not.toHaveBeenCalled()
  })
})
