import { render, screen } from "@testing-library/react"
import Grid from "@/components/towers/Grid"
import { BOARD_COLS, BOARD_ROWS } from "@/constants/game"
import { Board } from "@/interfaces/game"
import {
  mockedBlockE,
  mockedBlockEmpty,
  mockedBlockMedusa,
  mockedBlockO,
  mockedBlockR,
  mockedBlockS,
  mockedBlockT,
  mockedBlockW
} from "@/vitest.setup"

describe("Grid Component", () => {
  const mockedBoard: Board = [
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 0 (hidden to user)
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 1 (hidden to user)
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 2
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 3
    [mockedBlockT, mockedBlockO, mockedBlockW, mockedBlockEmpty, mockedBlockR, mockedBlockMedusa], // Row 4
    [mockedBlockS, mockedBlockMedusa, mockedBlockT, mockedBlockW, mockedBlockO, mockedBlockR], // Row 5
    [mockedBlockR, mockedBlockE, mockedBlockMedusa, mockedBlockS, mockedBlockT, mockedBlockO], // Row 6
    [mockedBlockO, mockedBlockR, mockedBlockS, mockedBlockMedusa, mockedBlockE, mockedBlockT], // Row 7
    [mockedBlockW, mockedBlockT, mockedBlockO, mockedBlockMedusa, mockedBlockS, mockedBlockMedusa], // Row 8
    [mockedBlockMedusa, mockedBlockW, mockedBlockT, mockedBlockO, mockedBlockR, mockedBlockS], // Row 9
    [mockedBlockS, mockedBlockE, mockedBlockW, mockedBlockT, mockedBlockO, mockedBlockR], // Row 10
    [mockedBlockR, mockedBlockO, mockedBlockMedusa, mockedBlockW, mockedBlockT, mockedBlockO], // Row 11
    [mockedBlockO, mockedBlockR, mockedBlockS, mockedBlockMedusa, mockedBlockW, mockedBlockT], // Row 12
    [mockedBlockW, mockedBlockO, mockedBlockR, mockedBlockS, mockedBlockR, mockedBlockT], // Row 13
    [mockedBlockT, mockedBlockW, mockedBlockT, mockedBlockE, mockedBlockT, mockedBlockMedusa] // Row 14
  ]

  it("should render a grid with correct number of rows and cells", () => {
    render(<Grid board={mockedBoard} />)

    const rows: HTMLDivElement[] = screen.getAllByRole("row")
    expect(rows).toHaveLength(BOARD_ROWS)

    const cells: HTMLDivElement[] = screen.getAllByRole("gridcell")
    expect(cells).toHaveLength(BOARD_ROWS * BOARD_COLS)
  })

  it("should focus on the board after mounting", () => {
    render(<Grid board={mockedBoard} />)

    const grid: HTMLDivElement = screen.getByRole("grid")

    expect(grid).toHaveFocus()
  })
})
