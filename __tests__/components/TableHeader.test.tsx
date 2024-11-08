import { render, screen } from "@testing-library/react"
import { mockTowersRoomState1Info, mockTowersTableState11Info } from "@/__mocks__/data/socketState"
import TableHeader from "@/components/game/TableHeader"

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
