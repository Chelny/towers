import { render, screen } from "@testing-library/react"
import TableHeader from "@/components/TableHeader"
import { mockedRoom1Table1WithHostAndTowersGameUsers } from "@/vitest.setup"

describe("TableHeader Component", () => {
  it("should render the table number and host username", () => {
    render(<TableHeader table={mockedRoom1Table1WithHostAndTowersGameUsers} />)

    expect(screen.getByText("Table: 1 - Host: john.doe")).toBeInTheDocument()
    expect(screen.getByText("Test Room 1")).toBeInTheDocument()
  })
})
