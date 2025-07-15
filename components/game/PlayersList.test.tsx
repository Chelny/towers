import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayersList from "@/components/game/PlayersList"
import { ModalProvider } from "@/context/ModalContext"
import { TableType } from "@/enums/table-type"
import { TableInvitationManagerPlainObject } from "@/server/towers/classes/TableInvitationManager"
import { UserPlainObject } from "@/server/towers/classes/User"
import { UserMuteManagerPlainObject } from "@/server/towers/classes/UserMuteManager"
import { mockUser1, mockUser2, mockUser3 } from "@/test/data/user"
import { mockUserStats1, mockUserStats2, mockUserStats3 } from "@/test/data/user-stats"
import { mockUseRouter, mockUseSearchParams } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: vi.fn(() => mockUseSearchParams),
}))

const handleSelectedPlayer: Mock = vi.fn()

const mockPlayers: UserPlainObject[] = [
  {
    user: mockUser1,
    rooms: {
      "mock-room-1": {
        createdAt: Date.now(),
      },
    },
    tables: {
      "mock-table-1": {
        id: "mock-table-1",
        roomId: "mock-room-1",
        tableNumber: 1,
        tableType: TableType.PUBLIC,
        seatNumber: 1,
        teamNumber: 1,
        isReady: false,
        isPlaying: false,
        createdAt: Date.now(),
      },
    },
    lastJoinedTable: {
      id: "mock-table-1",
      roomId: "mock-room-1",
      tableNumber: 1,
      tableType: TableType.PUBLIC,
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
  {
    user: mockUser2,
    rooms: {
      "mock-room-1": {
        createdAt: Date.now(),
      },
    },
    tables: {
      "mock-table-1": {
        id: "mock-table-1",
        roomId: "mock-room-1",
        tableNumber: 1,
        tableType: TableType.PUBLIC,
        seatNumber: 2,
        teamNumber: 1,
        isReady: false,
        isPlaying: false,
        createdAt: Date.now(),
      },
    },
    lastJoinedTable: {
      id: "mock-table-1",
      roomId: "mock-room-1",
      tableNumber: 1,
      tableType: TableType.PUBLIC,
      seatNumber: 2,
      teamNumber: 1,
      isReady: false,
      isPlaying: false,
      createdAt: Date.now(),
    },
    controlKeys: {
      MOVE_LEFT: "A",
      MOVE_RIGHT: "D",
      CYCLE: "W",
      DROP: "S",
      USE_ITEM: "Shift",
      USE_ITEM_ON_PLAYER_1: "1",
      USE_ITEM_ON_PLAYER_2: "2",
      USE_ITEM_ON_PLAYER_3: "3",
      USE_ITEM_ON_PLAYER_4: "4",
      USE_ITEM_ON_PLAYER_5: "5",
      USE_ITEM_ON_PLAYER_6: "6",
      USE_ITEM_ON_PLAYER_7: "7",
      USE_ITEM_ON_PLAYER_8: "8",
    },
    stats: mockUserStats2,
    tableInvitations: {} as TableInvitationManagerPlainObject,
    mute: {} as UserMuteManagerPlainObject,
  },
  {
    user: mockUser3,
    rooms: {
      "mock-room-1": {
        createdAt: Date.now(),
      },
    },
    tables: {
      "mock-table-1": {
        id: "mock-table-1",
        roomId: "mock-room-1",
        tableNumber: 1,
        tableType: TableType.PUBLIC,
        seatNumber: 3,
        teamNumber: 2,
        isReady: false,
        isPlaying: false,
        createdAt: Date.now(),
      },
    },
    lastJoinedTable: {
      id: "mock-table-3",
      roomId: "mock-room-1",
      tableNumber: 3,
      tableType: TableType.PUBLIC,
      seatNumber: 2,
      teamNumber: 1,
      isReady: false,
      isPlaying: false,
      createdAt: Date.now(),
    },
    controlKeys: {
      MOVE_LEFT: "J",
      MOVE_RIGHT: "L",
      CYCLE: "I",
      DROP: "K",
      USE_ITEM: "Enter",
      USE_ITEM_ON_PLAYER_1: "1",
      USE_ITEM_ON_PLAYER_2: "2",
      USE_ITEM_ON_PLAYER_3: "3",
      USE_ITEM_ON_PLAYER_4: "4",
      USE_ITEM_ON_PLAYER_5: "5",
      USE_ITEM_ON_PLAYER_6: "6",
      USE_ITEM_ON_PLAYER_7: "7",
      USE_ITEM_ON_PLAYER_8: "8",
    },
    stats: mockUserStats3,
    tableInvitations: {} as TableInvitationManagerPlainObject,
    mute: {} as UserMuteManagerPlainObject,
  },
]

describe("PlayersList", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the players list correctly", () => {
    render(
      <ModalProvider>
        <PlayersList roomId="mock-room-1" users={mockPlayers} onSelectedPlayer={handleSelectedPlayer} />
      </ModalProvider>,
    )

    mockPlayers.forEach((player: UserPlainObject) => {
      expect(screen.getByText(player.user?.username!)).toBeInTheDocument()
    })
  })

  it("should sort players by name in ascending and descending order", () => {
    render(
      <ModalProvider>
        <PlayersList roomId="mock-room-1" users={mockPlayers} onSelectedPlayer={handleSelectedPlayer} />
      </ModalProvider>,
    )

    mockPlayers.forEach((player: UserPlainObject) => {
      fireEvent.click(screen.getByText("Name"))
      expect(screen.getByText(player.user?.username!)).toBeInTheDocument()
    })
  })

  it("should call onSelectedPlayer when a player row is clicked", () => {
    render(
      <ModalProvider>
        <PlayersList roomId="mock-room-1" users={mockPlayers} onSelectedPlayer={handleSelectedPlayer} />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByText(mockPlayers[0].user?.username!))
    expect(handleSelectedPlayer).toHaveBeenCalledWith(mockPlayers[0].user?.id)
  })

  it("should open the PlayerInformation modal when a player row is double-clicked", () => {
    render(
      <ModalProvider>
        <PlayersList roomId="mock-room-1" users={mockPlayers} onSelectedPlayer={handleSelectedPlayer} />
      </ModalProvider>,
    )

    fireEvent.doubleClick(screen.getByText(mockPlayers[0].user?.username!))
    expect(screen.getByTestId("dialog_player-information")).toBeInTheDocument()
  })
})
