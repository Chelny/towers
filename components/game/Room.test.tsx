import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import Room from "@/components/game/Room"
import { ROUTE_TOWERS } from "@/constants/routes"
import { GameProvider } from "@/context/GameContext"
import { ModalProvider } from "@/context/ModalContext"
import { RoomLevel, RoomPlainObject } from "@/server/towers/classes/Room"
import { mockUseRouter, mockUseSearchParams } from "@/vitest.setup"

const mockRoom: RoomPlainObject = {
  id: "mock-room-1",
  name: "Test Room",
  level: RoomLevel.SOCIAL,
  isFull: false,
  tables: [],
  users: [],
  chat: { messages: [] },
}

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: vi.fn(() => ({
    ...mockUseSearchParams,
    get: vi.fn((key: string) => (key === "room" ? mockRoom.id : null)),
  })),
}))

const renderRoom = () => {
  render(
    <GameProvider>
      <ModalProvider>
        <Room />
      </ModalProvider>
    </GameProvider>,
  )
}

describe("Room", () => {
  it("should redirect if room join fails", () => {
    renderRoom()

    waitFor(() => {
      expect(mockUseRouter.push).toHaveBeenCalledWith(ROUTE_TOWERS.PATH)
    })
  })

  it("should render room after successful join", () => {
    renderRoom()

    waitFor(() => {
      expect(screen.getByText(mockRoom.name)).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Play Now")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Create Table")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Ratings")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Options")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Exit Room")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 1-2")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 3-4")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 5-6")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Team 7-8")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Who is Watching")).toBeInTheDocument()
    })
  })

  it("should not navigate to rooms list if room exit fails", () => {
    renderRoom()

    waitFor(() => {
      const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
      fireEvent.click(exitRoomButton)

      expect(mockUseRouter).not.toHaveBeenCalled()
    })
  })

  it("should navigate to the rooms list on successful room exit", () => {
    renderRoom()

    waitFor(() => {
      const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
      fireEvent.click(exitRoomButton)

      expect(mockUseRouter.push).toHaveBeenCalledWith(ROUTE_TOWERS.PATH)
    })
  })
})
