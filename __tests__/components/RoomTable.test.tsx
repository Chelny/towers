import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { mockRoom1Info, mockRoom1Table1Info, mockSocketRoom1Id } from "@/__mocks__/data/socketState"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import RoomTable from "@/components/game/RoomTable"
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

describe("RoomTable Component", () => {
  const mockAppDispatch: Mock = vi.fn()
  const mockSocketRoomThunkParams: SocketRoomThunk = {
    roomId: mockSocketRoom1Id,
  }

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
    // eslint-disable-next-line no-unused-vars
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.rooms[roomId]?.roomInfo")) return mockRoom1Info
        if (selectorFn.toString().includes("state.socket.rooms[roomId]?.isRoomInfoLoading")) return false
        return undefined
      }
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room tables correctly", () => {
    render(<RoomTable roomId={mockSocketRoom1Id} table={mockRoom1Table1Info} isRoomTablesLoading={false} />)
    expect(screen.getByText("#1")).toBeInTheDocument()
  })

  it("should navigate to the correct table on watch button click", async () => {
    mockAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockSocketRoomThunkParams),
    })

    render(<RoomTable roomId={mockSocketRoom1Id} table={mockRoom1Table1Info} isRoomTablesLoading={false} />)

    const watchButtons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Watch/i })
    expect(watchButtons[0]).toBeInTheDocument()
    fireEvent.click(watchButtons[0])

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        `${ROUTE_TOWERS.PATH}?room=${mockSocketRoom1Id}&table=${mockRoom1Table1Info.id}`
      )
    })
  })
})
