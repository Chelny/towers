import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import {
  mockSocketRoom1Id,
  mockSocketRoom1Table1Id,
  mockSocketState,
  mockStoreReducers,
  mockTowersTableState11Info
} from "@/__mocks__/data/socketState"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import RoomTable from "@/components/game/RoomTable"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"

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

describe("RoomTable Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: RootState) => unknown) => {
      const mockState = {
        ...mockStoreReducers,
        socket: mockSocketState
      }

      return selectorFn(mockState)
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room tables correctly", () => {
    render(<RoomTable roomId={mockSocketRoom1Id} tableId={mockSocketRoom1Table1Id} />)
    expect(screen.getByText("#1")).toBeInTheDocument()
  })

  it("should navigate to the correct table on watch button click", async () => {
    render(<RoomTable roomId={mockSocketRoom1Id} tableId={mockSocketRoom1Table1Id} />)

    const watchButtons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Watch/i })
    expect(watchButtons[0]).toBeInTheDocument()
    fireEvent.click(watchButtons[0])

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        `${ROUTE_TOWERS.PATH}?room=${mockTowersTableState11Info?.roomId}&table=${mockTowersTableState11Info?.id}`
      )
    })
  })
})
