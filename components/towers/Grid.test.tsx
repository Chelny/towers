import { render, screen } from "@testing-library/react"
import Grid from "@/components/towers/Grid"
import { BOARD_COLS, BOARD_ROWS } from "@/constants/game"
import { BoardPlainObject } from "@/server/towers/classes/Board"
import {
  mockBlockE,
  mockBlockEmpty,
  mockBlockMedusa,
  mockBlockO,
  mockBlockR,
  mockBlockS,
  mockBlockT,
  mockBlockW,
} from "@/test/data/board"

describe("Grid", () => {
  const mockBoard: BoardPlainObject = {
    grid: [
      [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty],
      [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty],
      [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty],
      [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty],
      [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty],
      [mockBlockT, mockBlockO, mockBlockW, mockBlockEmpty, mockBlockR, mockBlockMedusa],
      [mockBlockS, mockBlockMedusa, mockBlockT, mockBlockW, mockBlockO, mockBlockR],
      [mockBlockR, mockBlockE, mockBlockMedusa, mockBlockS, mockBlockT, mockBlockO],
      [mockBlockO, mockBlockR, mockBlockS, mockBlockMedusa, mockBlockE, mockBlockT],
      [mockBlockW, mockBlockT, mockBlockO, mockBlockMedusa, mockBlockS, mockBlockMedusa],
      [mockBlockMedusa, mockBlockW, mockBlockT, mockBlockO, mockBlockR, mockBlockS],
      [mockBlockS, mockBlockE, mockBlockW, mockBlockT, mockBlockO, mockBlockR],
      [mockBlockR, mockBlockO, mockBlockMedusa, mockBlockW, mockBlockT, mockBlockO],
      [mockBlockO, mockBlockR, mockBlockS, mockBlockMedusa, mockBlockW, mockBlockT],
      [mockBlockW, mockBlockO, mockBlockR, mockBlockS, mockBlockR, mockBlockT],
      [mockBlockT, mockBlockW, mockBlockT, mockBlockE, mockBlockT, mockBlockMedusa],
    ],
    isHooDetected: false,
    isGameOver: false,
  }

  it("should render a grid with correct number of rows and cells", () => {
    render(<Grid board={mockBoard} />)

    const rows: HTMLElement[] = screen.getAllByRole("row")
    expect(rows).toHaveLength(BOARD_ROWS)

    const cells: HTMLElement[] = screen.getAllByRole("gridcell")
    expect(cells).toHaveLength(BOARD_ROWS * BOARD_COLS)
  })

  it("should focus on the board after mounting", () => {
    render(<Grid board={mockBoard} />)

    const grid: HTMLElement = screen.getByRole("grid")
    grid.focus()
    expect(grid).toHaveFocus()
  })
})
