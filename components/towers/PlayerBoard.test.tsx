import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import PlayerBoard from "@/components/towers/PlayerBoard"
import { SocketEvents } from "@/constants/socket-events"
import { ModalProvider } from "@/context/ModalContext"
import { TowersGameState } from "@/enums/towers-game-state"
import { BoardPlainObject } from "@/server/towers/classes/Board"
import { NextPiecesPlainObject } from "@/server/towers/classes/NextPieces"
import { PowerBarPlainObject } from "@/server/towers/classes/PowerBar"
import { TableInvitationManagerPlainObject } from "@/server/towers/classes/TableInvitationManager"
import { UserMuteManagerPlainObject } from "@/server/towers/classes/UserMuteManager"
import { mockSocket } from "@/test/data/socket"
import { mockUser1 } from "@/test/data/user"
import { mockUserStats1 } from "@/test/data/user-stats"

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} crossOrigin={props.crossOrigin} role="img" alt={props.alt} />
  },
}))

const defaultSeat = {
  seatNumber: 1,
  targetNumber: 1,
  teamNumber: 1,
  occupiedBy: {
    user: mockUser1,
    rooms: {
      "mock-room-1": {
        createdAt: Date.now(),
      },
    },
    tables: {
      "mock-table-1": {
        roomId: "mock-room-1",
        tableNumber: 1,
        seatNumber: 1,
        teamNumber: 1,
        isReady: false,
        isPlaying: false,
        createdAt: Date.now(),
      },
    },
    lastJoinedTable: {
      roomId: "mock-room-1",
      tableNumber: 1,
      seatNumber: 1,
      teamNumber: 1,
      isReady: false,
      isPlaying: false,
      createdAt: Date.now(),
    },
    controlKeys: {
      MOVE_LEFT: "ArrowLeft",
      MOVE_RIGHT: "ArrowRight",
      CYCLE: "ArrowUp",
      DROP: "ArrowDown",
      USE_ITEM: "Space",
      USE_ITEM_ON_PLAYER_1: "1",
      USE_ITEM_ON_PLAYER_2: "2",
      USE_ITEM_ON_PLAYER_3: "3",
      USE_ITEM_ON_PLAYER_4: "4",
      USE_ITEM_ON_PLAYER_5: "5",
      USE_ITEM_ON_PLAYER_6: "6",
      USE_ITEM_ON_PLAYER_7: "7",
      USE_ITEM_ON_PLAYER_8: "8",
    },
    stats: mockUserStats1,
    tableInvitations: {} as TableInvitationManagerPlainObject,
    mute: {} as UserMuteManagerPlainObject,
  },
  board: {} as BoardPlainObject,
  nextPieces: { nextPiece: {} } as NextPiecesPlainObject,
  powerBar: {} as PowerBarPlainObject,
}

const defaultProps = {
  roomId: "mock-room-1",
  tableId: "mock-table-1",
  seat: defaultSeat,
  isOpponentBoard: false,
  gameState: TowersGameState.WAITING,
  readyTeamsCount: 0,
  isSitAccessGranted: false,
  isUserSeatedAnywhere: false,
  currentUser: defaultSeat.occupiedBy,
  isRatingsVisible: true,
  onSit: vi.fn(),
  onStand: vi.fn(),
  onStart: vi.fn(),
  onNextPowerBarItem: vi.fn(),
}

describe("PlayerBoard", () => {
  it("should display Join button when seat is available", () => {
    const openSeat = {
      ...defaultSeat,
      occupiedBy: undefined,
    }

    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} isSitAccessGranted seat={openSeat} />
      </ModalProvider>,
    )

    expect(screen.getByText("Join")).toBeInTheDocument()
  })

  it("should call onSit when Join button is clicked", () => {
    const onSit: Mock = vi.fn()

    const openSeat = {
      ...defaultSeat,
      occupiedBy: undefined,
    }

    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} seat={openSeat} isSitAccessGranted onSit={onSit} />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByText("Join"))
    expect(onSit).toHaveBeenCalled()
  })

  it("should render player avatar and username when seat is occupied", () => {
    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} />
      </ModalProvider>,
    )
    expect(screen.getByTestId("user-avatar_image")).toBeInTheDocument()
    expect(screen.getByText("john.doe")).toBeInTheDocument()
  })

  it("should call onStand when Stand button is clicked", () => {
    const onStand: Mock = vi.fn()

    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} seat={defaultSeat} isSitAccessGranted isUserSeatedAnywhere onStand={onStand} />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByText("Stand"))
    expect(onStand).toHaveBeenCalled()
  })

  it("should call onStart when Start button is clicked", () => {
    const onStart: Mock = vi.fn()

    render(
      <ModalProvider>
        <PlayerBoard
          {...defaultProps}
          onStart={onStart}
          gameState={TowersGameState.WAITING}
          readyTeamsCount={2}
          isSitAccessGranted
          isUserSeatedAnywhere
        />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByText("Start"))
    expect(onStart).toHaveBeenCalled()
  })

  it("should emit PIECE_CYCLE when up key is pressed", async () => {
    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} isUserSeatedAnywhere />
      </ModalProvider>,
    )

    const board: HTMLElement = screen.getByTestId("player-board_container_grid")
    board.focus()

    fireEvent.keyDown(document, { key: "ArrowUp", code: "ArrowUp" })

    waitFor(() => {
      expect(mockSocket.current.emit).toHaveBeenCalledWith(SocketEvents.PIECE_CYCLE, {
        tableId: "mock-table-1",
        seatNumber: 1,
      })
    })
  })

  it("should emit PIECE_MOVE when right key is pressed", async () => {
    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} isUserSeatedAnywhere />
      </ModalProvider>,
    )

    const board: HTMLElement = screen.getByTestId("player-board_container_grid")
    board.focus()

    fireEvent.keyDown(document, { key: "ArrowRight", code: "ArrowRight" })

    waitFor(() => {
      expect(mockSocket.current.emit).toHaveBeenCalledWith(SocketEvents.PIECE_MOVE, {
        tableId: "mock-table-1",
        seatNumber: 1,
        direction: "right",
      })
    })
  })

  it("should emit PIECE_MOVE when left key is pressed", async () => {
    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} isUserSeatedAnywhere />
      </ModalProvider>,
    )

    const board: HTMLElement = screen.getByTestId("player-board_container_grid")
    board.focus()

    fireEvent.keyDown(document, { key: "ArrowLeft", code: "ArrowLeft" })

    waitFor(() => {
      expect(mockSocket.current.emit).toHaveBeenCalledWith(SocketEvents.PIECE_MOVE, {
        tableId: "mock-table-1",
        seatNumber: 1,
        direction: "left",
      })
    })
  })

  it("should emit PIECE_DROP when spacebar is pressed", async () => {
    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} isUserSeatedAnywhere />
      </ModalProvider>,
    )

    const board: HTMLElement = screen.getByTestId("player-board_container_grid")
    board.focus()

    fireEvent.keyDown(document, { key: "Space", code: "Space" })

    waitFor(() => {
      expect(mockSocket.current.emit).toHaveBeenCalledWith(SocketEvents.POWER_USE, {
        tableId: "mock-table-1",
        seatNumber: 1,
      })
    })
  })

  it("should not emit control key event when not current user", () => {
    render(
      <ModalProvider>
        <PlayerBoard {...defaultProps} />
      </ModalProvider>,
    )

    const board: HTMLElement = screen.getByTestId("player-board_container_grid")
    board.focus()

    fireEvent.keyDown(document, { key: "ArrowLeft", code: "ArrowLeft" })
    expect(mockSocket.current.emit).not.toHaveBeenCalled()
  })
})
