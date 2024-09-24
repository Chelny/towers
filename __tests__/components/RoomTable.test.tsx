import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import RoomTable from "@/components/RoomTable"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { SocketState } from "@/redux/features/socket-slice"
import { SocketRoomThunk } from "@/redux/thunks/socket-thunks"
import {
  mockedAuthenticatedSession,
  mockedRoom1Info,
  mockedSocketRoom1Id,
  mockedSocketRoom1Table1Id,
  mockedUser1
} from "@/vitest.setup"

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

describe("RoomTable Component", () => {
  const mockedAppDispatch: Mock = vi.fn()
  const mockedSocketRoomThunkParams: SocketRoomThunk = {
    room: mockedSocketRoom1Id,
    isTable: false,
    username: mockedUser1.username!
  }

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockedAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
    // eslint-disable-next-line no-unused-vars
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: { socket: SocketState }) => unknown) => {
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.roomInfo")) {
        return mockedRoom1Info
      }
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.isRoomInfoLoading")) {
        return false
      }
      return undefined
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room tables correctly", () => {
    render(<RoomTable roomId={mockedSocketRoom1Id} />)
    expect(screen.getByText("#1")).toBeInTheDocument()
  })

  it("should navigate to the correct table on watch button click", async () => {
    mockedAppDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockedSocketRoomThunkParams)
    })

    render(<RoomTable roomId={mockedSocketRoom1Id} />)

    const watchButtons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Watch/i })
    expect(watchButtons[1]).toBeInTheDocument()
    fireEvent.click(watchButtons[0])

    await waitFor(() => {
      expect(mockedRouterPush).toHaveBeenCalledWith(`?room=${mockedSocketRoom1Id}&table=${mockedSocketRoom1Table1Id}`)
    })
  })
})
