import { fireEvent, render, screen } from "@testing-library/react"
import { useSelector } from "react-redux"
import { Mock } from "vitest"
import RoomTable from "@/components/RoomTable"
import { mockedRoomWithTablesCount, mockedSocketStateRooms } from "@/vitest.setup"

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
    vi.mocked(useSelector).mockReturnValue({
      rooms: mockedSocketStateRooms,
      tablesLoading: false
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room tables correctly", () => {
    render(<RoomTable roomId={mockedRoomWithTablesCount.room?.id!} />)

    expect(screen.getByText("#1")).toBeInTheDocument()
  })

  it("should navigate to the correct table on watch button click", () => {
    render(<RoomTable roomId={mockedRoomWithTablesCount.room?.id!} />)

    const watchButton: HTMLButtonElement = screen.getByRole("button", { name: /Watch/i })
    fireEvent.click(watchButton)

    expect(mockedRouterPush).toHaveBeenCalledWith(
      "?room=7b09737d-aca1-4aaf-be74-5b1d40579224&table=e812b595-1086-484b-9b70-2727ba589060"
    )
  })
})
