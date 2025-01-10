import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import RoomTable from "@/components/game/RoomTable"
import { ROUTE_TOWERS } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"
import { mockSession } from "@/test/data/session"
import {
  mockSocketRoom1Table1Id,
  mockSocketState,
  mockStoreReducers,
  mockTowersRoomState1Tables,
  mockTowersTableState11Info,
} from "@/test/data/socketState"
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

describe("RoomTable Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: RootState) => unknown) => {
      const mockState = {
        ...mockStoreReducers,
        socket: mockSocketState,
      }

      return selectorFn(mockState)
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room tables correctly", () => {
    render(<RoomTable table={mockTowersRoomState1Tables[mockSocketRoom1Table1Id]} isTablesLoading={false} />)
    expect(screen.getByText("#1")).toBeInTheDocument()
  })

  it("should navigate to the correct table on watch button click", async () => {
    render(<RoomTable table={mockTowersRoomState1Tables[mockSocketRoom1Table1Id]} isTablesLoading={false} />)

    const watchButtons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Watch/i })
    expect(watchButtons[0]).toBeInTheDocument()
    fireEvent.click(watchButtons[0])

    await waitFor(() => {
      expect(mockUseRouter.push).toHaveBeenCalledWith(
        `${ROUTE_TOWERS.PATH}?room=${mockTowersTableState11Info?.roomId}&table=${mockTowersTableState11Info?.id}`,
      )
    })
  })
})
