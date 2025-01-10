import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayerBoard from "@/components/towers/PlayerBoard"

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} crossOrigin={props.crossOrigin} role="img" alt={props.alt} />
  },
}))

const mockHandleStartGame: Mock = vi.fn()

vi.mock("@/hooks/useTowers", () => ({
  useTowers: () => ({
    board: [],
    startGame: mockHandleStartGame,
    isPlaying: false,
    isGameOver: false,
    score: 100,
    nextPieces: [[]],
    powerBar: [],
  }),
}))

// FIXME: Game logic
describe.skip("PlayerBoard Component", () => {
  const mockHandleChooseSeat: Mock = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  // it("should render player information with score", () => {
  //   render(<PlayerBoard seatNumber={1} onChooseSeat={mockHandleChooseSeat} />)

  //   expect(screen.getByText("the_player1 (100)")).toBeInTheDocument()
  // })

  // it("should display the 'Join' button when not seated", () => {
  //   render(<PlayerBoard seatNumber={1} isSeated={false} onChooseSeat={mockHandleChooseSeat} />)

  //   const joinButton: HTMLButtonElement = screen.getByText("Join")
  //   expect(joinButton).toBeInTheDocument()

  //   fireEvent.click(joinButton)
  //   expect(mockHandleChooseSeat).toHaveBeenCalledWith(1)
  // })

  // it("should display the 'Stand' and 'Start' buttons when seated", () => {
  //   render(<PlayerBoard seatNumber={1} isSeated={true} onChooseSeat={mockHandleChooseSeat} />)

  //   const standButton: HTMLButtonElement = screen.getByText("Stand")
  //   const startButton: HTMLButtonElement = screen.getByText("Start")

  //   expect(standButton).toBeInTheDocument()
  //   expect(startButton).toBeInTheDocument()

  //   fireEvent.click(standButton)
  //   expect(mockHandleChooseSeat).toHaveBeenCalledWith(null)

  //   fireEvent.click(startButton)
  //   expect(mockHandleStartGame).toHaveBeenCalled()
  // })

  // it("should render the grid and power bar correctly for the player’s board", () => {
  //   render(<PlayerBoard seatNumber={1} isOpponentBoard={false} onChooseSeat={mockHandleChooseSeat} />)

  //   expect(screen.getByTestId("player-board-power-bar-container")).toBeInTheDocument()
  //   expect(screen.getByTestId("player-board-grid-container")).toBeInTheDocument()
  // })

  // it("should render smaller avatar and text for opponent’s board", () => {
  //   render(<PlayerBoard seatNumber={2} isOpponentBoard={true} onChooseSeat={mockHandleChooseSeat} />)

  //   const avatar: HTMLImageElement = screen.getByAltText("")
  //   const playerName: HTMLDivElement = screen.getByText("the_player2 (100)")

  //   expect(avatar).toHaveAttribute("width", "16")
  //   expect(avatar).toHaveAttribute("height", "16")
  //   expect(playerName).toHaveClass("text-sm")
  // })
})
