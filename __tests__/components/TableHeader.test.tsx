import { render, screen } from "@testing-library/react"
import { mockRoom1Table1Info } from "@/__mocks__/data/socketState"
import TableHeader from "@/components/game/TableHeader"

describe("TableHeader Component", () => {
  it("should render the table number and host username", () => {
    render(<TableHeader table={mockRoom1Table1Info} />)

    expect(
      screen.getByText(`Table: ${mockRoom1Table1Info.tableNumber} - Host: ${mockRoom1Table1Info.host.username}`)
    ).toBeInTheDocument()
    expect(screen.getByText(mockRoom1Table1Info.room!.name)).toBeInTheDocument()
  })
})
