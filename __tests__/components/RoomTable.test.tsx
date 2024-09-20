import { fireEvent, render, screen } from "@testing-library/react"
import { useSelector } from "react-redux"
import { Mock } from "vitest"
import RoomTable from "@/components/RoomTable"
import { SocketState } from "@/redux/features"
import { mockedRoom1Info, mockedSocketRoom1Id, mockedSocketRoom1Table1Id } from "@/vitest.setup"

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
  useSelector: vi.fn()
}))

describe("RoomTable Component", () => {
  beforeEach(() => {
    vi.mocked(useSelector).mockImplementation((selectorFn: (_: SocketState) => unknown) => {
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

  it("should navigate to the correct table on watch button click", () => {
    render(<RoomTable roomId={mockedSocketRoom1Id} />)

    const watchButtons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Watch/i })
    expect(watchButtons[1]).toBeInTheDocument()
    fireEvent.click(watchButtons[0])

    expect(mockedRouterPush).toHaveBeenCalledWith(`?room=${mockedSocketRoom1Id}&table=${mockedSocketRoom1Table1Id}`)
  })
})
