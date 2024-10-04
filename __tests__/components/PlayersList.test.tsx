import { TowersUser } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayersList from "@/components/game/PlayersList"
import {
  mockedRoom1Table1TowersUserRoomTable1,
  mockedRoom1Users,
  mockedUser1,
  mockedUser2,
  mockedUser3
} from "@/vitest.setup"

describe("PlayersList Component", () => {
  const players: TowersUser[] = mockedRoom1Users
  const handleSelectedPlayer: Mock = vi.fn()

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the players list correctly", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    expect(screen.getByText(mockedUser1.username!)).toBeInTheDocument()
    expect(screen.getByText(mockedUser2.username!)).toBeInTheDocument()
    expect(screen.getByText(mockedUser3.username!)).toBeInTheDocument()
  })

  it("should sort players by name in ascending and descending order", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.click(screen.getByText("Name"))
    expect(screen.getByText(mockedUser1.username!)).toBeInTheDocument()

    fireEvent.click(screen.getByText("Name"))
    expect(screen.getByText(mockedUser3.username!)).toBeInTheDocument()
  })

  it("should call onSelectedPlayer when a player row is clicked", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.click(screen.getByText(mockedUser1.username!))
    expect(handleSelectedPlayer).toHaveBeenCalledWith(mockedRoom1Table1TowersUserRoomTable1.id)
  })

  it("should open the PlayerInformation modal when a player row is double-clicked", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.doubleClick(screen.getByText(mockedUser1.username!))
    expect(screen.getByTestId("player-information-modal")).toBeInTheDocument()
  })
})
