import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayersList from "@/components/game/PlayersList"
import { ModalProvider } from "@/context/ModalContext"
import { TableInvitationManagerPlainObject } from "@/server/towers/classes/TableInvitationManager"
import { UserPlainObject } from "@/server/towers/classes/User"
import { UserMuteManagerPlainObject } from "@/server/towers/classes/UserMuteManager"
import { mockJoinedRooms } from "@/test/data/room"
import {
  mockJoinedTables1,
  mockJoinedTables2,
  mockJoinedTables3,
  mockLastJoinedTable1,
  mockLastJoinedTable2,
  mockLastJoinedTable3,
} from "@/test/data/table"
import { mockUser1, mockUser2, mockUser3 } from "@/test/data/user"
import { mockUserControlKeys1, mockUserControlKeys2, mockUserControlKeys3 } from "@/test/data/user-control-keys"
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
    rooms: mockJoinedRooms,
    tables: mockJoinedTables1,
    lastJoinedTable: mockLastJoinedTable1,
    controlKeys: mockUserControlKeys1,
    stats: mockUserStats1,
    tableInvitations: {} as TableInvitationManagerPlainObject,
    mute: {} as UserMuteManagerPlainObject,
  },
  {
    user: mockUser2,
    rooms: mockJoinedRooms,
    tables: mockJoinedTables2,
    lastJoinedTable: mockLastJoinedTable2,
    controlKeys: mockUserControlKeys2,
    stats: mockUserStats2,
    tableInvitations: {} as TableInvitationManagerPlainObject,
    mute: {} as UserMuteManagerPlainObject,
  },
  {
    user: mockUser3,
    rooms: mockJoinedRooms,
    tables: mockJoinedTables3,
    lastJoinedTable: mockLastJoinedTable3,
    controlKeys: mockUserControlKeys3,
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
