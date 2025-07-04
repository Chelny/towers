import { render, screen } from "@testing-library/react"
import GridRow from "@/components/towers/GridRow"
import { BoardRow } from "@/interfaces/towers"
import { mockDefaultBlockProps } from "@/test/data/board"

describe("GridRow", () => {
  const mockRow: BoardRow = [
    { ...mockDefaultBlockProps, letter: "T", powerType: "defense" },
    { ...mockDefaultBlockProps, letter: "O", powerType: undefined },
    { ...mockDefaultBlockProps, letter: "W", powerType: "attack" },
    { ...mockDefaultBlockProps, letter: "E", powerType: undefined },
  ]

  it("should render a row with the correct number of cells", () => {
    render(<GridRow rowIndex={2} row={mockRow} />)

    const cells: HTMLDivElement[] = screen.getAllByText(/T|O/)
    expect(cells).toHaveLength(5)
  })

  it("should hide rows that are below the hidden row threshold", () => {
    render(
      <>
        <GridRow rowIndex={0} row={mockRow} />
        <GridRow rowIndex={1} row={mockRow} />
        <GridRow rowIndex={2} row={mockRow} />
        <GridRow rowIndex={3} row={mockRow} />
      </>,
    )

    const rows: HTMLDivElement[] = screen.getAllByRole("row")
    expect(rows[0]).toHaveClass("hidden")
    expect(rows[1]).toHaveClass("hidden")
    expect(rows[2]).toHaveClass("hidden")
    expect(rows[3]).not.toHaveClass("hidden")
  })

  it("should render cells correctly for opponent board", () => {
    render(<GridRow rowIndex={2} row={mockRow} isOpponentBoard={true} />)

    const cells: HTMLDivElement[] = screen.getAllByRole("gridcell")
    cells.forEach((cell: HTMLDivElement) => {
      expect(cell).toHaveClass("w-grid-cell-opponent-width")
    })
  })
})
