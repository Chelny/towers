import { render, screen } from "@testing-library/react"
import {
  mockBlockE,
  mockBlockEmpty,
  mockBlockMedusa,
  mockBlockO,
  mockBlockR,
  mockBlockS,
  mockBlockT,
  mockBlockW
} from "@/__mocks__/data/board"
import Grid from "@/components/towers/Grid"
import { BOARD_COLS, BOARD_ROWS } from "@/constants/game"
import { Board } from "@/interfaces/game"

describe("Grid Component", () => {
  const mockBoard: Board = [
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 0 (hidden to user)
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 1 (hidden to user)
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 2
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 3
    [mockBlockT, mockBlockO, mockBlockW, mockBlockEmpty, mockBlockR, mockBlockMedusa], // Row 4
    [mockBlockS, mockBlockMedusa, mockBlockT, mockBlockW, mockBlockO, mockBlockR], // Row 5
    [mockBlockR, mockBlockE, mockBlockMedusa, mockBlockS, mockBlockT, mockBlockO], // Row 6
    [mockBlockO, mockBlockR, mockBlockS, mockBlockMedusa, mockBlockE, mockBlockT], // Row 7
    [mockBlockW, mockBlockT, mockBlockO, mockBlockMedusa, mockBlockS, mockBlockMedusa], // Row 8
    [mockBlockMedusa, mockBlockW, mockBlockT, mockBlockO, mockBlockR, mockBlockS], // Row 9
    [mockBlockS, mockBlockE, mockBlockW, mockBlockT, mockBlockO, mockBlockR], // Row 10
    [mockBlockR, mockBlockO, mockBlockMedusa, mockBlockW, mockBlockT, mockBlockO], // Row 11
    [mockBlockO, mockBlockR, mockBlockS, mockBlockMedusa, mockBlockW, mockBlockT], // Row 12
    [mockBlockW, mockBlockO, mockBlockR, mockBlockS, mockBlockR, mockBlockT], // Row 13
    [mockBlockT, mockBlockW, mockBlockT, mockBlockE, mockBlockT, mockBlockMedusa] // Row 14
  ]

  it("should render a grid with correct number of rows and cells", () => {
    render(<Grid board={mockBoard} />)

    const rows: HTMLDivElement[] = screen.getAllByRole("row")
    expect(rows).toHaveLength(BOARD_ROWS)

    const cells: HTMLDivElement[] = screen.getAllByRole("gridcell")
    expect(cells).toHaveLength(BOARD_ROWS * BOARD_COLS)
  })

  it("should focus on the board after mounting", () => {
    render(<Grid board={mockBoard} />)

    const grid: HTMLDivElement = screen.getByRole("grid")

    expect(grid).toHaveFocus()
  })
})
