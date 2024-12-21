import { ITowersUserRoomTable } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockTowersRoomState1Users } from "@/__mocks__/data/socketState"
import { mockSession } from "@/__mocks__/data/users"
import PlayersList from "@/components/game/PlayersList"
import { authClient } from "@/lib/auth-client"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

describe("PlayersList Component", () => {
  const handleSelectedPlayer: Mock = vi.fn()
  const players: ITowersUserRoomTable[] = mockTowersRoomState1Users
  const player1: ITowersUserRoomTable = mockTowersRoomState1Users[0]

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  it("should render the players list correctly", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    players.forEach((player: ITowersUserRoomTable) => {
      expect(screen.getByText(player.userProfile?.user?.username!)).toBeInTheDocument()
    })
  })

  it("should sort players by name in ascending and descending order", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    players.forEach((player: ITowersUserRoomTable) => {
      fireEvent.click(screen.getByText("Name"))
      expect(screen.getByText(player.userProfile?.user?.username!)).toBeInTheDocument()
    })
  })

  it("should call onSelectedPlayer when a player row is clicked", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.click(screen.getByText(players[0].userProfile?.user?.username!))
    expect(handleSelectedPlayer).toHaveBeenCalledWith(player1.id)
  })

  it("should open the PlayerInformation modal when a player row is double-clicked", () => {
    render(<PlayersList users={players} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.doubleClick(screen.getByText(players[0].userProfile?.user?.username!))
    expect(screen.getByTestId("player-information-modal")).toBeInTheDocument()
  })
})
