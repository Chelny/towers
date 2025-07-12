import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import RoomsList from "@/components/game/RoomsList"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { RoomLevel, RoomPlainObject } from "@/server/towers/classes/Room"
import { UserPlainObject } from "@/server/towers/classes/User"
import { mockSession } from "@/test/data/session"
import { mockSocket } from "@/test/data/socket"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
}))

describe("RoomsList", () => {
  const mockRoom1: RoomPlainObject = {
    id: "mock-room-1",
    name: "Room One",
    level: RoomLevel.SOCIAL,
    isFull: false,
    tables: [],
    users: [{ user: mockSession.user } as UserPlainObject],
    chat: { messages: [] },
  }

  const mockRoom2: RoomPlainObject = {
    id: "mock-room-2",
    name: "Room Two",
    level: RoomLevel.BEGINNER,
    isFull: true,
    tables: [],
    users: [],
    chat: { messages: [] },
  }

  const mockRoom3: RoomPlainObject = {
    id: "mock-room-3",
    name: "Room Three",
    level: RoomLevel.ADVANCED,
    isFull: false,
    tables: [],
    users: [],
    chat: { messages: [] },
  }

  beforeEach(() => {
    mockSocket.current.on = vi.fn((event, callback) => {
      if (event === SocketEvents.ROOMS_LIST) {
        callback({ rooms: [mockRoom1, mockRoom2, mockRoom3] })
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("renders all room names", async () => {
    render(<RoomsList />)

    await waitFor(() => {
      expect(screen.getByText(mockRoom1.name)).toBeInTheDocument()
      expect(screen.getByText(mockRoom2.name)).toBeInTheDocument()
      expect(screen.getByText(mockRoom3.name)).toBeInTheDocument()
    })
  })

  it("disables join button when room is full", async () => {
    render(<RoomsList />)

    await waitFor(() => {
      const fullButton = screen.getByRole("button", { name: /Full/i })
      expect(fullButton).toBeDisabled()
    })
  })

  it("navigates to correct route on Join", async () => {
    render(<RoomsList />)

    const joinButtons: HTMLElement[] = await screen.findAllByRole("button", { name: /Join/i })
    const joinRoom3Button: HTMLElement | undefined = joinButtons.at(1)

    fireEvent.click(joinRoom3Button!)

    await waitFor(() => {
      expect(mockUseRouter.push).toHaveBeenCalledWith(`${ROUTE_TOWERS.PATH}?room=${mockRoom3.id}`)
    })
  })

  it("does not navigate if user already joined", async () => {
    render(<RoomsList />)

    const joinButtons: HTMLElement[] = await screen.findAllByRole("button", { name: /Joined/i })
    const joinRoom1Button: HTMLElement | undefined = joinButtons.at(0)

    fireEvent.click(joinRoom1Button!)

    await waitFor(() => {
      expect(mockUseRouter.push).not.toHaveBeenCalled()
    })
  })
})
