import { ITowersRoomWithUsersCount } from "@prisma/client"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import { mockRoom1, mockRoom2, mockRoom3 } from "@/__mocks__/data/rooms"
import { mockSocketRoom3Id, mockSocketState, mockStoreReducers } from "@/__mocks__/data/socketState"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import RoomsList from "@/components/game/RoomsList"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"

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

describe("RoomsList Component", () => {
  const mockAppDispatch: Mock = vi.fn()
  const mockRooms: ITowersRoomWithUsersCount[] = [
    {
      ...mockRoom1,
      usersCount: 123,
    },
    {
      ...mockRoom2,
      usersCount: 300,
    },
    {
      ...mockRoom3,
      usersCount: 234,
    },
  ]

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
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

  it("should render room details correctly", () => {
    render(<RoomsList rooms={mockRooms} />)

    expect(screen.getByText(mockRoom1.name)).toBeInTheDocument()
    expect(screen.getByText(mockRoom1.difficulty)).toBeInTheDocument()
    expect(screen.getByText(`${mockRooms[0].usersCount} users`)).toBeInTheDocument()
    expect(screen.getByText(mockRoom2.name)).toBeInTheDocument()
    expect(screen.getByText(mockRoom2.difficulty)).toBeInTheDocument()
    expect(screen.getByText(`${mockRooms[1].usersCount} users`)).toBeInTheDocument()
    expect(screen.getByText(mockRoom3.name)).toBeInTheDocument()
    expect(screen.getByText(mockRoom3.difficulty)).toBeInTheDocument()
    expect(screen.getByText(`${mockRooms[2].usersCount} users`)).toBeInTheDocument()

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    expect(buttons.length).toEqual(mockRooms.length)
    buttons.forEach((button: HTMLButtonElement) => expect(button).toBeInTheDocument())
  })

  it("should disable the join button when the room is full", () => {
    render(<RoomsList rooms={mockRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    expect(buttons[1]).toBeDisabled()
  })

  it("should navigate to the correct room when join button is clicked", async () => {
    render(<RoomsList rooms={mockRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Join/i })
    fireEvent.click(buttons[2])

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(`${ROUTE_TOWERS.PATH}?room=${mockSocketRoom3Id}`)
    })
  })

  it("should not trigger navigation when join button is disabled", async () => {
    render(<RoomsList rooms={mockRooms} />)

    const buttons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Joined/i })
    fireEvent.click(buttons[0])

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled()
    })
  })
})
