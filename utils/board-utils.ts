import { BOARD_COLS, BOARD_ROWS } from "@/constants/game"
import { Block, Board, BoardBlock, BoardRow, PowerLevel } from "@/interfaces/game"
import { isEmptyCell, isMedusaBlock } from "@/utils/block-guards-utils"

/**
 * Checks if swapping two blocks on the board will create adjacent blocks of the same color and letter.
 * Adjacency includes horizontal and vertical directions.
 *
 * @param board - The current state of the board.
 * @param row1 - The row index of the first block to swap.
 * @param col1 - The column index of the first block to swap.
 * @param row2 - The row index of the second block to swap.
 * @param col2 - The column index of the second block to swap.
 * @returns True if the swap would result in adjacent blocks of the same color and letter; otherwise, false.
 */
export const areAdjacentBlocksSame = (
  board: BoardRow[],
  row1: number,
  col1: number,
  row2: number,
  col2: number
): boolean => {
  // Temporarily swap the blocks
  const temp: Block = board[row1][col1]
  board[row1][col1] = board[row2][col2]
  board[row2][col2] = temp

  // Function to check if two blocks are the same type
  const blocksAreSame = (r1: number, c1: number, r2: number, c2: number): boolean => {
    if (
      r1 >= 0 &&
      r1 < BOARD_ROWS &&
      c1 >= 0 &&
      c1 < BOARD_COLS &&
      r2 >= 0 &&
      r2 < BOARD_ROWS &&
      c2 >= 0 &&
      c2 < BOARD_COLS
    ) {
      return board[r1][c1]?.letter === board[r2][c2]?.letter
    }

    return false // Return false if any block is out of bounds
  }

  // Function to check horizontal adjacency for a block
  const checkHorizontal = (r: number, c: number): boolean => {
    // Check left and right blocks horizontally
    return (
      (c > 0 && blocksAreSame(r, c, r, c - 1)) || // Left of (r, c)
      (c < BOARD_COLS - 1 && blocksAreSame(r, c, r, c + 1)) // Right of (r, c)
    )
  }

  // Function to check vertical adjacency for a block
  const checkVertical = (r: number, c: number): boolean => {
    // Check directly below and above the current block (r, c)
    const below: boolean = r < BOARD_ROWS - 1 && blocksAreSame(r, c, r + 1, c)
    const above: boolean = r > 0 && blocksAreSame(r, c, r - 1, c)

    return below || above
  }

  // Function to check all relevant adjacencies for a block
  const checkAllAdjacent = (r: number, c: number): boolean => {
    return checkHorizontal(r, c) || checkVertical(r, c)
  }

  // Check if either of the swapped blocks create adjacent blocks with the same letter
  const result: boolean = checkAllAdjacent(row1, col1) || checkAllAdjacent(row2, col2)

  // Swap the blocks back to their original positions
  board[row2][col2] = board[row1][col1]
  board[row1][col1] = temp

  return result
}

/**
 * Checks if swapping two blocks on the board will create a setup of three blocks in a row either horizontally or
 * vertically. The function temporarily swaps the blocks, checks for the setup, and then swaps them back.
 *
 * @param board - The current state of the board.
 * @param row1 - The row index of the first block to swap.
 * @param col1 - The column index of the first block to swap.
 * @param row2 - The row index of the second block to swap.
 * @param col2 - The column index of the second block to swap.
 * @returns True if the swap sets up three blocks in a row; otherwise, false.
 */
export const isSettingUpThreeInRow = (
  board: BoardRow[],
  row1: number,
  col1: number,
  row2: number,
  col2: number
): boolean => {
  const checkHorizontal = (row: number, col: number): boolean => {
    const block: Block = board[row][col]
    let count: number = 1

    // Check left
    for (let i = col - 1; i >= 0 && board[row][i]?.letter === block.letter; i--) {
      count++
    }

    // Check right
    for (let i = col + 1; i < BOARD_COLS && board[row][i]?.letter === block.letter; i++) {
      count++
    }

    return count >= 3
  }

  const checkVertical = (row: number, col: number): boolean => {
    const block: Block = board[row][col]
    let count: number = 1

    // Check up
    for (let i = row - 1; i >= 0 && board[i][col]?.letter === block.letter; i--) {
      count++
    }

    // Check down
    for (let i = row + 1; i < BOARD_ROWS && board[i][col]?.letter === block.letter; i++) {
      count++
    }

    return count >= 3
  }

  const checkDiagonal = (row: number, col: number): boolean => {
    const block: Block = board[row][col]
    let count1: number = 1
    let count2: number = 1

    // Check bottom-right to top-left
    for (let i = 1; row - i >= 0 && col + i < BOARD_COLS && board[row - i][col + i]?.letter === block.letter; i++) {
      count1++
    }

    for (let i = 1; row + i < BOARD_ROWS && col - i >= 0 && board[row + i][col - i]?.letter === block.letter; i++) {
      count1++
    }

    // Check top-left to bottom-right
    for (let i = 1; row - i >= 0 && col - i >= 0 && board[row - i][col - i]?.letter === block.letter; i++) {
      count2++
    }

    for (
      let i = 1;
      row + i < BOARD_ROWS && col + i < BOARD_COLS && board[row + i][col + i]?.letter === block.letter;
      i++
    ) {
      count2++
    }

    return count1 >= 3 || count2 >= 3
  }

  // Temporarily swap the blocks to test if it sets up three in a row
  const temp: Block = board[row1][col1]
  board[row1][col1] = board[row2][col2]
  board[row2][col2] = temp

  // Check if the swap creates three in a row
  const isCreatesThreeInRow: boolean =
    checkHorizontal(row1, col1) ||
    checkVertical(row1, col1) ||
    checkHorizontal(row2, col2) ||
    checkVertical(row2, col2) ||
    checkDiagonal(row1, col1) ||
    checkDiagonal(row2, col2)

  // Swap the blocks back to their original positions
  board[row2][col2] = board[row1][col1]
  board[row1][col1] = temp

  return isCreatesThreeInRow
}

/**
 * Calculates the number of blocks to rearrange on the board based on the given power level.
 * The function determines the total number of non-empty, non-Medusa blocks on the board,
 * and then applies a percentage based on the power level to calculate the number of blocks to rearrange.
 *
 * @param board - The current state of the board represented as a 2D array of cells.
 * @param powerLevel - The power level indicating the intensity of the operation ("minor", "normal", or "mega").
 * @param totalBlocks - Optional. The total number of blocks on the board.
 * @returns The number of blocks to rearrange based on the power level.
 */
export const getNumBlocksToRearrange = (board: Board, powerLevel: PowerLevel, totalBlocks?: number): number => {
  if (typeof totalBlocks === "undefined") {
    totalBlocks = board.reduce(
      (count: number, row: BoardRow) =>
        count + row.filter((cell: BoardBlock) => !isEmptyCell(cell) && !isMedusaBlock(cell)).length,
      0
    )
  }

  const percentage: number = powerLevel === "minor" ? 0.1 : powerLevel === "normal" ? 0.25 : 0.5

  return Math.ceil(totalBlocks * percentage)
}
