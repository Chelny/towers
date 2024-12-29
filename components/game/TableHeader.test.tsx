import { render, screen } from "@testing-library/react"
import TableHeader from "@/components/game/TableHeader"
import { mockTowersRoomState1Info, mockTowersTableState11Info } from "@/test/data/socketState"

describe("TableHeader Component", () => {
  it("should render the table number and host username", () => {
    render(<TableHeader room={mockTowersRoomState1Info} table={mockTowersTableState11Info} />)

    expect(
      screen.getByText(
        `Table: ${mockTowersTableState11Info?.tableNumber} - Host: ${mockTowersTableState11Info?.host?.user?.username}`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(mockTowersRoomState1Info?.name!)).toBeInTheDocument()
  })
})
