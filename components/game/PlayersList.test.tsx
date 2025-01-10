import { ITowersUserProfile } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayersList from "@/components/game/PlayersList"
import { authClient } from "@/lib/auth-client"
import { mockSession } from "@/test/data/session"
import { mockTowersRoomState1Users } from "@/test/data/socketState"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

describe("PlayersList Component", () => {
  const handleSelectedPlayer: Mock = vi.fn()
  const players: ITowersUserProfile[] = mockTowersRoomState1Users
  const player1: ITowersUserProfile = mockTowersRoomState1Users[0]

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  it("should render the players list correctly", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    players.forEach((player: ITowersUserProfile) => {
      expect(screen.getByText(player.user?.username!)).toBeInTheDocument()
    })
  })

  it("should sort players by name in ascending and descending order", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    players.forEach((player: ITowersUserProfile) => {
      fireEvent.click(screen.getByText("Name"))
      expect(screen.getByText(player.user?.username!)).toBeInTheDocument()
    })
  })

  it("should call onSelectedPlayer when a player row is clicked", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.click(screen.getByText(players[0].user?.username!))
    expect(handleSelectedPlayer).toHaveBeenCalledWith(player1.id)
  })

  it("should open the PlayerInformation modal when a player row is double-clicked", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.doubleClick(screen.getByText(players[0].user?.username!))
    expect(screen.getByTestId("player-information-modal")).toBeInTheDocument()
  })
})
