import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayerBoard from "@/components/towers/PlayerBoard"

const mockedHandleStartGame: Mock = vi.fn()

vi.mock("@/hooks/useTowers", () => ({
  useTowers: () => ({
    board: [],
    startGame: mockedHandleStartGame,
    isPlaying: false,
    isGameOver: false,
    score: 100,
    nextPieces: [[]],
    powerBar: []
  })
}))

describe("PlayerBoard Component", () => {
  const mockedHandleChooseSeat: Mock = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render player information with score", () => {
    render(<PlayerBoard seatNumber={1} onChooseSeat={mockedHandleChooseSeat} />)

    expect(screen.getByText("the_player1 (100)")).toBeInTheDocument()
  })

  it("should display the 'Join' button when not seated", () => {
    render(<PlayerBoard seatNumber={1} isSeated={false} onChooseSeat={mockedHandleChooseSeat} />)

    const joinButton: HTMLButtonElement = screen.getByText("Join")
    expect(joinButton).toBeInTheDocument()

    fireEvent.click(joinButton)
    expect(mockedHandleChooseSeat).toHaveBeenCalledWith(1)
  })

  it("should display the 'Stand' and 'Start' buttons when seated", () => {
    render(<PlayerBoard seatNumber={1} isSeated={true} onChooseSeat={mockedHandleChooseSeat} />)

    const standButton: HTMLButtonElement = screen.getByText("Stand")
    const startButton: HTMLButtonElement = screen.getByText("Start")

    expect(standButton).toBeInTheDocument()
    expect(startButton).toBeInTheDocument()

    fireEvent.click(standButton)
    expect(mockedHandleChooseSeat).toHaveBeenCalledWith(null)

    fireEvent.click(startButton)
    expect(mockedHandleStartGame).toHaveBeenCalled()
  })

  it("should render the grid and power bar correctly for the player’s board", () => {
    render(<PlayerBoard seatNumber={1} isOpponentBoard={false} onChooseSeat={mockedHandleChooseSeat} />)

    expect(screen.getByTestId("player-board-power-bar-container")).toBeInTheDocument()
    expect(screen.getByTestId("player-board-grid-container")).toBeInTheDocument()
  })

  it("should render smaller avatar and text for opponent’s board", () => {
    render(<PlayerBoard seatNumber={2} isOpponentBoard={true} onChooseSeat={mockedHandleChooseSeat} />)

    const avatar: HTMLImageElement = screen.getByAltText("")
    const playerName: HTMLDivElement = screen.getByText("the_player2 (100)")

    expect(avatar).toHaveAttribute("width", "16")
    expect(avatar).toHaveAttribute("height", "16")
    expect(playerName).toHaveClass("text-sm")
  })
})
