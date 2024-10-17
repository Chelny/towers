import { IRoomListItemWithUsersCount } from "@prisma/client"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { mockRoom1, mockRoom2 } from "@/__mocks__/data/rooms"
import { mockSocketRoom1Id } from "@/__mocks__/data/socketState"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import RoomsList from "@/components/game/RoomsList"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { SidebarState } from "@/redux/features/sidebar-slice"
import { SocketState } from "@/redux/features/socket-slice"
import { SocketRoomThunk } from "@/redux/thunks/room-thunks"

const { useRouter, mockRouterPush } = vi.hoisted(() => {
  const mockRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockRouterPush }),
    mockRouterPush
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

vi.mock("@/redux/thunks/room-thunks")

describe("RoomsList Component", () => {
  const mockAppDispatch: Mock = vi.fn()
  const mockSocketRoomThunkParams: SocketRoomThunk = {
    roomId: mockSocketRoom1Id
  }
  const mockRooms: IRoomListItemWithUsersCount[] = [
    {
      ...mockRoom1,
      userProfiles: [],
      usersCount: 123
    },
    {
      ...mockRoom2,
      userProfiles: [],
      usersCount: 301
    }
  ]

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
    // eslint-disable-next-line no-unused-vars
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.isConnected")) return true
        if (selectorFn.toString().includes("state.socket.rooms")) return mockRoom1
        return undefined
      }
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room details correctly", () => {
    render(<RoomsList rooms={mockRooms} />)

    expect(screen.getByText(mockRoom1.name)).toBeInTheDocument()
    expect(screen.getByText(mockRoom1.difficulty)).toBeInTheDocument()
    expect(screen.getByText("123 users")).toBeInTheDocument()
    expect(screen.getByText(mockRoom2.name)).toBeInTheDocument()
    expect(screen.getByText(mockRoom2.difficulty)).toBeInTheDocument()
    expect(screen.getByText("301 users")).toBeInTheDocument()

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    expect(buttons.length).toEqual(2)
    buttons.forEach((button: HTMLButtonElement) => expect(button).toBeInTheDocument())
  })

  it("should disable the join button when the room is full", () => {
    render(<RoomsList rooms={mockRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    expect(buttons[1]).toBeDisabled()
  })

  it("should navigate to the correct room when join button is clicked", async () => {
    mockAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockSocketRoomThunkParams)
    })

    render(<RoomsList rooms={mockRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    fireEvent.click(buttons[0])

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(`${ROUTE_TOWERS.PATH}?room=${mockSocketRoom1Id}`)
    })
  })

  it("should not trigger navigation when join button is disabled", () => {
    render(<RoomsList rooms={mockRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    fireEvent.click(buttons[1])

    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})
