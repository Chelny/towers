import { RoomLevel } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { useSelector } from "react-redux"
import { Mock } from "vitest"
import RoomsList from "@/components/RoomsList"
import { RoomWithCount } from "@/interfaces"
import { mockedRoom1, mockedRoom2 } from "@/vitest.setup"

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

describe("RoomsList Component", () => {
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
    vi.mocked(useSelector).mockReturnValue({
      isConnected: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room details correctly", () => {
    render(<RoomsList rooms={mockedRooms} />)

    expect(screen.getByText("Test Room 1")).toBeInTheDocument()
    expect(screen.getByText(RoomLevel.SOCIAL)).toBeInTheDocument()
    expect(screen.getByText("123 users")).toBeInTheDocument()
    expect(screen.getByText("Test Room 2")).toBeInTheDocument()
    expect(screen.getByText(RoomLevel.BEGINNER)).toBeInTheDocument()
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

  it("should navigate to the correct room when join button is clicked", () => {
    render(<RoomsList rooms={mockedRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    fireEvent.click(buttons[0])

    expect(mockedRouterPush).toHaveBeenCalledWith("/towers?room=7b09737d-aca1-4aaf-be74-5b1d40579224")
  })

  it("should not trigger navigation when join button is disabled", () => {
    render(<RoomsList rooms={mockedRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    fireEvent.click(buttons[1])

    expect(mockedRouterPush).not.toHaveBeenCalled()
  })
})
