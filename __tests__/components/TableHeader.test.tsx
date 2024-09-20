import { render, screen } from "@testing-library/react"
import TableHeader from "@/components/TableHeader"
import { mockedRoom1, mockedRoom1Table1, mockedRoom1Table1Info, mockedUser1 } from "@/vitest.setup"

describe("TableHeader Component", () => {
  it("should render the table number and host username", () => {
    render(<TableHeader table={mockedRoom1Table1Info} />)

    expect(
      screen.getByText(`Table: ${mockedRoom1Table1.tableNumber} - Host: ${mockedUser1.username}`)
    ).toBeInTheDocument()
    expect(screen.getByText(mockedRoom1.name)).toBeInTheDocument()
  })
})
