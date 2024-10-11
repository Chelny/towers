import { ITowersUserProfile } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockRoom1Users } from "@/__mocks__/data/socketState"
import { mockRoom1Table1TowersUserProfile1 } from "@/__mocks__/data/towersUserProfiles"
import PlayersList from "@/components/game/PlayersList"

describe("PlayersList Component", () => {
  const players: ITowersUserProfile[] = mockRoom1Users
  const handleSelectedPlayer: Mock = vi.fn()

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the players list correctly", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    players.forEach((player: ITowersUserProfile) => {
      expect(screen.getByText(player.user?.username!)).toBeInTheDocument()
    })
  })

  it("should sort players by name in ascending and descending order", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    players.forEach((player: ITowersUserProfile) => {
      fireEvent.click(screen.getByText("Name"))
      expect(screen.getByText(player.user?.username!)).toBeInTheDocument()
    })
  })

  it("should call onSelectedPlayer when a player row is clicked", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.click(screen.getByText(players[0].user?.username!))
    expect(handleSelectedPlayer).toHaveBeenCalledWith(mockRoom1Table1TowersUserProfile1.id)
  })

  it("should open the PlayerInformation modal when a player row is double-clicked", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.doubleClick(screen.getByText(players[0].user?.username!))
    expect(screen.getByTestId("player-information-modal")).toBeInTheDocument()
  })
})
