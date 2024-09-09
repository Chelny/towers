import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayersList from "@/components/PlayersList"
import { TowersGameUserWithUserAndTables } from "@/interfaces"

describe("PlayersList Component", () => {
  const players: TowersGameUserWithUserAndTables[] = [
    { id: "1", user: { username: "Alice" }, rating: 1200, gamesCompleted: 10, table: { tableNumber: 1 } },
    { id: "2", user: { username: "Bob" }, rating: 1500, gamesCompleted: 12, table: { tableNumber: 2 } },
    { id: "3", user: { username: "Charlie" }, rating: 900, gamesCompleted: 5, table: { tableNumber: 3 } }
  ] as TowersGameUserWithUserAndTables[]
  const handleSelectedPlayer: Mock = vi.fn()

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the players list correctly", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })

  it("should sort players by name in ascending and descending order", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.click(screen.getByText("Name"))
    expect(screen.getByText("Alice")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Name"))
    expect(screen.getByText("Charlie")).toBeInTheDocument()
  })

  it("should call onSelectedPlayer when a player row is clicked", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.click(screen.getByText("Alice"))
    expect(handleSelectedPlayer).toHaveBeenCalledWith("1")
  })

  it("should open the PlayerInformation modal when a player row is double-clicked", () => {
    render(<PlayersList users={players} full={true} onSelectedPlayer={handleSelectedPlayer} />)

    fireEvent.doubleClick(screen.getByText("Alice"))
    expect(screen.getByTestId("player-information-modal")).toBeInTheDocument()
  })
})
