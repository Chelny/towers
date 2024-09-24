import { render, screen } from "@testing-library/react"
import GridRow from "@/components/game/GridRow"
import { BoardRow } from "@/interfaces/game"
import { mockedDefaultTowersBlockProps } from "@/vitest.setup"

describe("GridRow Component", () => {
  const mockedRow: BoardRow = [
    { ...mockedDefaultTowersBlockProps, letter: "T", powerType: "defense" },
    { ...mockedDefaultTowersBlockProps, letter: "O", powerType: null },
    { ...mockedDefaultTowersBlockProps, letter: "W", powerType: "attack" }
  ]

  it("should render a row with the correct number of cells", () => {
    render(<GridRow rowIndex={2} row={mockedRow} />)

    const cells: HTMLDivElement[] = screen.getAllByText(/T|O/)
    expect(cells).toHaveLength(5)
  })

  it("should hide rows that are below the hidden row threshold", () => {
    render(
      <>
        <GridRow rowIndex={0} row={mockedRow} />
        <GridRow rowIndex={1} row={mockedRow} />
        <GridRow rowIndex={2} row={mockedRow} />
      </>
    )

    const rows: HTMLDivElement[] = screen.getAllByRole("row")
    expect(rows[0]).toHaveClass("hidden")
    expect(rows[1]).toHaveClass("hidden")
    expect(rows[2]).not.toHaveClass("hidden")
  })

  it("should render cells correctly for opponent board", () => {
    render(<GridRow rowIndex={2} row={mockedRow} isOpponentBoard={true} />)

    const cells: HTMLDivElement[] = screen.getAllByRole("gridcell")
    cells.forEach((cell: HTMLDivElement) => {
      expect(cell).toHaveClass("w-grid-cell-opponent")
    })
  })
})
