import { Dispatch, useReducer } from "react"
import {
  BOARD_COLS,
  BOARD_ROWS,
  HIDDEN_ROWS_COUNT,
  PIECE_LENGTH,
  PIECE_STARTING_COL,
  PIECE_STARTING_ROW,
  POWER_BAR_LENGTH
} from "@/constants"
import { BlockPosition, EmptyCell, MedusaBlock, MidasBlock, PowerBlock, TowersBlock } from "@/interfaces"
import {
  Block,
  Board,
  BoardAction,
  BoardBlock,
  BoardRow,
  BoardState,
  Piece,
  PowerBarBlock,
  PowerLevel,
  Powers,
  TowersLetter
} from "@/interfaces"
import {
  areAdjacentBlocksSame,
  getNumBlocksToRearrange,
  isEmptyCell,
  isMedusaBlock,
  isSettingUpThreeInRow,
  isSpecialDiamond,
  isTowersBlock
} from "@/utils"

/**
 * Custom hook for managing the game board state and actions.
 * Returns the current board state and a function to dispatch actions.
 *
 * @returns A tuple containing the current board state and the dispatch function for board actions.
 */
export function useTowersBoard(): [BoardState, Dispatch<BoardAction>] {
  const [boardState, dispatchBoardState] = useReducer(
    boardReducer,
    {
      board: [],
      droppingPiece: [
        { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
        { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
        { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null }
      ],
      droppingRow: PIECE_STARTING_ROW,
      droppingColumn: PIECE_STARTING_COL,
      powerBar: [],
      usedPowerBlock: null
    },
    (emptyState: BoardState) => {
      const state: BoardState = {
        ...emptyState,
        board: getEmptyBoard()
      }
      return state
    }
  )

  return [boardState, dispatchBoardState]
}

export function createPieceBlock(letter: TowersLetter): TowersBlock {
  return { letter, powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null }
}

export function createMedusaBlock(): MedusaBlock {
  return { letter: "ME", powerType: null, powerLevel: null }
}

export function createMidasBlock(): MidasBlock {
  return { letter: "MI", powerType: null, powerLevel: null }
}

export function createEmptyCell(): EmptyCell {
  return { letter: " ", powerType: null, powerLevel: null }
}

/**
 * Generates an empty game board with specified number of rows and default number of columns.
 *
 * @param rows - Number of rows for the board.
 * @returns Empty game board with specified dimensions.
 */
export function getEmptyBoard(rows: number = BOARD_ROWS): Board {
  return Array.from({ length: rows }, () => Array(BOARD_COLS).fill(createEmptyCell()))
}

/**
 * Generates a single random block configuration.
 *
 * @param powers - Optional The current powers received by block type.
 * @returns An object representing a block with a letter, powerType, and powerLevel.
 */
function generateBlock(powers?: Powers): TowersBlock {
  const blockLetters: TowersLetter[] = ["T", "O", "W", "E", "R", "S"]
  const randomIndex: number = Math.floor(Math.random() * blockLetters.length)
  const randomBlock: TowersLetter = blockLetters[randomIndex]

  if (powers && powers[randomBlock]?.isPowerToBeApplied) {
    const power: PowerBlock = powers[randomBlock]

    // Mark power as applied to prevent reapplication
    powers[randomBlock].isPowerToBeApplied = false

    return {
      letter: randomBlock,
      powerType: power.powerType,
      powerLevel: power.powerLevel,
      isToBeRemoved: false,
      brokenBlockNumber: null
    }
  }

  return createPieceBlock(randomBlock)
}

/**
 * Generates a random piece configuration using available block types,
 * considering specific attack or defense block types based on powers received.
 *
 * @param powers - Optional The current powers received by block type.
 * @returns Randomly generated piece configuration.
 */
export function getRandomPiece(powers?: Powers): Piece {
  let shuffledBlocks: Piece = []

  while (shuffledBlocks.length < PIECE_LENGTH) {
    shuffledBlocks.push(generateBlock(powers))
  }

  return shuffledBlocks
}

/**
 * Generates a medusa piece
 *
 * @returns A three-piece of stones
 */
export function getMedusaPiece(): Piece {
  return [createMedusaBlock(), createMedusaBlock(), createMedusaBlock()]
}

/**
 * Generates a medusa piece
 *
 * @returns A half orange, half yellow three-piece twizzler falls
 */
export function getMidasPiece(): Piece {
  return [createMidasBlock(), createMidasBlock(), createMidasBlock()]
}

/**
 * Cycles the blocks in a given piece configuration.
 * This function reorders the blocks in the piece such that the block in the first position
 * moves to the last position, and all other blocks shift one position forward.
 *
 * @param piece - The piece configuration to cycle, represented as an array of blocks.
 * @returns The cycled piece configuration.
 */
function cycleBlocks(piece: Piece): Piece {
  return [piece[1], piece[2], piece[0]]
}

/**
 * Checks for collisions between a piece and the game board at a specified position.
 *
 * @param board - Current game board configuration.
 * @param currentPiece - Piece configuration to check for collisions.
 * @param row - Row position on the board to place the piece.
 * @param column - Column position on the board to place the piece.
 * @returns Boolean indicating collision detection.
 */
export function hasCollisions(board: Board, currentPiece: Piece, row: number, column: number): boolean {
  // Check if the current piece has collisions with the board
  for (let rowIndex = 0; rowIndex < currentPiece.length; rowIndex++) {
    const boardRow: number = row + rowIndex
    const boardCol: number = column

    // Check if the cell of the current piece is occupied and if the corresponding cell on the board is not empty
    if (
      !isEmptyCell(currentPiece[rowIndex]) && // Access the current block in the piece
      (boardRow < 0 || // Ensure row index is non-negative
        boardRow >= BOARD_ROWS || // Ensure row index is within board bounds
        boardCol >= BOARD_COLS || // Ensure column index is within board bounds
        boardCol < 0 ||
        !isEmptyCell(board[boardRow][boardCol]))
    ) {
      return true // Collision detected
    }
  }

  return false // No collisions detected
}

/**
 * Checks if the game is over based on the position of the current piece and the state of the board.
 * The game is considered over if any part of the piece reaches the top hidden rows or if there are
 * blocks in the top hidden rows after committing the piece.
 *
 * @param newBoard - The current state of the game board.
 * @param droppingRow - The row position of the current dropping piece.
 * @param droppingColumn - The column position of the current dropping piece.
 * @returns Returns `true` if the game is over, otherwise `false`.
 */
export function checkGameOver(newBoard: Board, droppingRow: number, droppingColumn: number): boolean {
  if (droppingRow < HIDDEN_ROWS_COUNT || (droppingRow === HIDDEN_ROWS_COUNT && droppingColumn === PIECE_STARTING_COL)) {
    const hasBlocksInTopRows: boolean = newBoard
      .slice(0, HIDDEN_ROWS_COUNT)
      .some((row: BoardRow) => row.some((block: BoardBlock) => !isEmptyCell(block)))

    if (hasBlocksInTopRows) return true
  }

  return false
}

/**
 * Function to check if a position is within board bounds
 *
 * @param row - The row index to check.
 * @param col - The column index to check.
 * @returns A boolean indicating whether the specified row and column are within the visible board bounds.
 */
export function isInBounds(row: number, col: number): boolean {
  return row >= HIDDEN_ROWS_COUNT && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS
}

/**
 * Reducer function to handle state transitions for board actions.
 *
 * @param state - Current state of the game board.
 * @param action - BoardAction dispatched to modify the board state.
 * @returns New state of the game board after applying the action.
 */
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  const newState: BoardState = { ...state }

  switch (action.type) {
    case "start":
      const firstPiece: Piece = getRandomPiece()
      return {
        board: getEmptyBoard(),
        droppingPiece: firstPiece,
        droppingRow: PIECE_STARTING_ROW,
        droppingColumn: PIECE_STARTING_COL,
        powerBar: [],
        usedPowerBlock: null
      }
    case "drop":
      newState.droppingRow++
      break
    case "move":
      const rotatedShape: Piece = action.isRotating ? cycleBlocks(newState.droppingPiece) : newState.droppingPiece
      let columnOffset: number = action.isPressingLeft ? -1 : 0

      columnOffset = action.isPressingRight ? 1 : columnOffset

      if (!hasCollisions(newState.board, rotatedShape, newState.droppingRow, newState.droppingColumn + columnOffset)) {
        newState.droppingColumn += columnOffset
        newState.droppingPiece = rotatedShape
      }
      break
    case "commit":
      return {
        ...newState,
        board: [...getEmptyBoard(BOARD_ROWS - action.newBoard!.length), ...action.newBoard!],
        droppingPiece: action.newPiece!,
        droppingRow: PIECE_STARTING_ROW,
        droppingColumn: PIECE_STARTING_COL
      }
    case "addToPowerBar":
      const updatedPowerBar: PowerBarBlock[] = [...newState.powerBar, action.newAddedPowerBlock!]

      if (updatedPowerBar.length > POWER_BAR_LENGTH) {
        updatedPowerBar.splice(0, updatedPowerBar.length - POWER_BAR_LENGTH)
      }

      return { ...newState, powerBar: updatedPowerBar }
    case "useItemFromPowerBar":
      if (newState.powerBar.length > 0) {
        newState.usedPowerBlock = newState.powerBar.pop() as PowerBarBlock
      }

      return { ...newState, powerBar: newState.powerBar }
    case "addRow":
      return addRow(newState)
    case "removeRow":
      return removeRow(newState)
    case "dither":
      return dither(newState, action.powerLevel!)
    case "clump":
      return clump(newState, action.powerLevel!)
    case "addStones":
      return addStones(newState, action.powerLevel!)
    case "dropStones":
      return dropStones(newState, action.powerLevel!)
    case "defuse":
      return defuse(newState, action.powerLevel!)
    case "colorBlast":
      return colorBlast(newState)
    case "removePowers":
      return removePowers(newState, action.powerLevel!)
    case "colorPlague":
      return colorPlague(newState)
    case "specialSpeedDrop":
      return specialSpeedDrop(newState)
    case "specialRemovePowers":
      return specialRemovePowers(newState)
    case "specialRemoveStones":
      return specialRemoveStones(newState)
    default:
      throw new Error(`The action type: "${action.type}" does not exist.`)
  }

  return newState
}

/**
 * Adds an additional row to the bottom of an opponent's screen.
 *
 * @param newState - The current state of the board.
 * @returns The new state of the board after adding the row.
 */
function addRow(newState: BoardState): BoardState {
  const newRow: TowersBlock[] = Array.from({ length: BOARD_COLS }, () => generateBlock())

  newState.board.splice(0, 1)
  newState.board.push(newRow)

  return newState
}

/**
 * Removes the bottom row from the board.
 *
 * @param newState - The current state of the board.
 * @returns The new state of the board after removing the row.
 */
function removeRow(newState: BoardState): BoardState {
  const newEmptyRow: EmptyCell[] = Array.from({ length: BOARD_COLS }, () => createEmptyCell())

  newState.board.pop()
  newState.board.unshift(newEmptyRow)

  return newState
}

/**
 * Changes the position of a certain number of blocks so that there is never a break or setup of breaks after the
 * dither is used. Dither does not move stones. Minor, normal, and mega versions exist.
 *
 * @param newState - The current state of the board.
 * @param powerLevel - The power level determining how many stones to add.
 * @returns The new state of the board after dithering.
 */
function dither(newState: BoardState, powerLevel: PowerLevel): BoardState {
  const numBlocks: number = getNumBlocksToRearrange(newState.board, powerLevel)

  for (let i = 0; i < numBlocks; i++) {
    let randomRow1: number, randomCol1: number, randomRow2: number, randomCol2: number

    do {
      randomRow1 = Math.floor(Math.random() * BOARD_ROWS)
      randomCol1 = Math.floor(Math.random() * BOARD_COLS)
      randomRow2 = Math.floor(Math.random() * BOARD_ROWS)
      randomCol2 = Math.floor(Math.random() * BOARD_COLS)
    } while (
      // Ensure positions are different and valid
      (randomRow1 === randomRow2 && randomCol1 === randomCol2) ||
      isEmptyCell(newState.board[randomRow1][randomCol1]) ||
      isEmptyCell(newState.board[randomRow2][randomCol2]) ||
      isMedusaBlock(newState.board[randomRow1][randomCol1]) ||
      isMedusaBlock(newState.board[randomRow2][randomCol2]) ||
      // Ensure dithering does not set up three in a row
      isSettingUpThreeInRow(newState.board, randomRow1, randomCol1, randomRow2, randomCol2) ||
      // Check if the swap would result in adjacent blocks of the same color and letter
      areAdjacentBlocksSame(newState.board, randomRow1, randomCol1, randomRow2, randomCol2)
    )

    // Swap the blocks
    const temp: Block = newState.board[randomRow1][randomCol1]
    newState.board[randomRow1][randomCol1] = newState.board[randomRow2][randomCol2]
    newState.board[randomRow2][randomCol2] = temp
  }

  return newState
}

/**
 * Opposite of dither. Clump rearranges a certain number of blocks on the board to setup breaks. It will not however set
 * up a break directly (in other words, it never sets up three in a row). Clump comes in three flavors - minor, normal,
 * and mega and does not move stones.
 *
 * @param newState - The current state of the board.
 * @param powerLevel - The power level determining how many stones to add.
 * @returns The new state of the board after clumping.
 */
function clump(newState: BoardState, powerLevel: PowerLevel): BoardState {
  const numBlocks: number = getNumBlocksToRearrange(newState.board, powerLevel)

  for (let i = 0; i < numBlocks; i++) {
    let randomRow1: number, randomCol1: number, randomRow2: number, randomCol2: number

    // Find two different random positions on the board
    do {
      randomRow1 = Math.floor(Math.random() * BOARD_ROWS)
      randomCol1 = Math.floor(Math.random() * BOARD_COLS)
      randomRow2 = Math.floor(Math.random() * BOARD_ROWS)
      randomCol2 = Math.floor(Math.random() * BOARD_COLS)
    } while (
      // Ensure positions are different and valid
      (randomRow1 === randomRow2 && randomCol1 === randomCol2) ||
      isEmptyCell(newState.board[randomRow1][randomCol1]) ||
      isEmptyCell(newState.board[randomRow2][randomCol2]) ||
      isMedusaBlock(newState.board[randomRow1][randomCol1]) ||
      isMedusaBlock(newState.board[randomRow2][randomCol2]) ||
      // Ensure clumping does not set up three in a row
      isSettingUpThreeInRow(newState.board, randomRow1, randomCol1, randomRow2, randomCol2)
    )

    // Swap or rearrange blocks (simplified logic)
    const temp: Block = newState.board[randomRow1][randomCol1]
    newState.board[randomRow1][randomCol1] = newState.board[randomRow2][randomCol2]
    newState.board[randomRow2][randomCol2] = temp

    // After swapping, ensure no three in a row are set up
    if (isSettingUpThreeInRow(newState.board, randomRow1, randomCol1, randomRow2, randomCol2)) {
      // Swap back if it sets up three in a row
      newState.board[randomRow2][randomCol2] = newState.board[randomRow1][randomCol1]
      newState.board[randomRow1][randomCol1] = temp
    }
  }

  return newState
}

/**
 * Minor adds one stone, normal adds two stones, and mega adds three to an opponent to the top of the board of one
 * opponent.
 *
 * @param newState - The current state of the board.
 * @param powerLevel - The power level determining how many stones to add.
 * @returns The new state of the board after adding the stones.
 */
function addStones(newState: BoardState, powerLevel: PowerLevel): BoardState {
  const numStones: number = powerLevel === "mega" ? 3 : powerLevel === "normal" ? 2 : 1
  let stonesAdded: number = 0

  do {
    const randomCol: number = Math.floor(Math.random() * BOARD_COLS)
    let isAdded: boolean = false

    for (let row = HIDDEN_ROWS_COUNT; row < BOARD_ROWS; row++) {
      if (!isEmptyCell(newState.board[row][randomCol]) && !isMedusaBlock(newState.board[row][randomCol])) {
        newState.board[row][randomCol] = createMedusaBlock()
        isAdded = true
        break
      }
    }

    if (isAdded) stonesAdded++
  } while (stonesAdded < numStones)

  return newState
}

/**
 * Takes one to three stones depending on minor, normal or mega and places them on the bottom row of the same column;
 * the rest of the blocks are moved up. If a stone already exists on the bottom row, the stone is dropped to the next
 * highest row without a stone.
 *
 * @param newState - The current state of the board.
 * @param powerLevel - The power level determining how many stones to drop.
 * @returns The new state of the board after dropping the stones.
 */
function dropStones(newState: BoardState, powerLevel: PowerLevel): BoardState {
  const numStones: number = powerLevel === "mega" ? 3 : powerLevel === "normal" ? 2 : 1
  const stonesToDrop: BlockPosition[] = []

  // Identify stones in each column
  for (let col = 0; col < BOARD_COLS; col++) {
    let dropRow: number = BOARD_ROWS - 1

    // Find the all stones from the bottom up in the column
    while (dropRow >= HIDDEN_ROWS_COUNT) {
      if (isEmptyCell(newState.board[dropRow][col])) {
        break
      } else if (isMedusaBlock(newState.board[dropRow][col])) {
        // If stone is found, save its position
        stonesToDrop.push({ col, row: dropRow })
      }

      dropRow--
    }
  }

  // Select random stones to drop based on numStones
  const selectedStones: BlockPosition[] = stonesToDrop.sort(() => 0.5 - Math.random()).slice(0, numStones)

  // Process each stone to drop in its respective column
  for (let stone of selectedStones) {
    const { col, row }: BlockPosition = stone
    const tempStone: Block = newState.board[row][col]

    // Shift up blocks below the stone
    for (let r = row; r < BOARD_ROWS - 1; r++) {
      newState.board[r][col] = newState.board[r + 1][col]
    }

    // Place the temp stone at the bottom row
    newState.board[BOARD_ROWS - 1][col] = tempStone
  }

  return newState
}

/**
 * A black stone replaces a purple power lodged in the board of an opponent. Minor, normal, and mega versions exist.
 *
 * @param newState - The current state of the board.
 * @param powerLevel - The power level indicating the intensity of the defuse action ("minor", "normal", or "mega").
 * @returns The new state of the board after defusing the purple powers.
 */
function defuse(newState: BoardState, powerLevel: PowerLevel): BoardState {
  const totalPurplePowers: number = newState.board.reduce(
    (count: number, row: BoardRow) => count + row.filter((block: BoardBlock) => block.letter === "E").length,
    0
  )

  // Determine the number of purple powers to defuse based on the power level
  const numPowersToDefuse: number = getNumBlocksToRearrange(newState.board, powerLevel, totalPurplePowers)
  let powersDefused: number = 0

  // Traverse the board to find and replace purple powers with black stones
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (powersDefused >= numPowersToDefuse) return newState

      if (newState.board[row][col].letter === "E") {
        newState.board[row][col] = createMedusaBlock()
        powersDefused++
      }
    }
  }

  return newState
}

/**
 * Any purple power within the board suddenly becomes the center of a 3x3 purple square. In other words, all
 * surrounding pieces of either a defuse or color blast already in the board become purple blocks. No different
 * versions.
 *
 * @param newState - The current state of the board.
 * @returns The new state of the board after applying the color blast.
 */
function colorBlast(newState: BoardState): BoardState {
  // Collect positions of all purple powers (E)
  const positions: BlockPosition[] = []

  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (newState.board[row][col].letter === "E") {
        positions.push({ row, col })
      }
    }
  }

  // Transform the collected positions into 3x3 purple squares
  for (const { row, col } of positions) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow: number = row + i
        const newCol: number = col + j

        if (
          newRow >= 0 &&
          newRow < BOARD_ROWS &&
          newCol >= 0 &&
          newCol < BOARD_COLS &&
          !isEmptyCell(newState.board[newRow][newCol]) &&
          !isMedusaBlock(newState.board[newRow][newCol])
        ) {
          newState.board[newRow][newCol] = createPieceBlock("E")
        }
      }
    }
  }

  return newState
}

/**
 * Takes either one, two or three powers depending on minor/normal/mega from opponent's power bar and
 * places them on the bottom row of their board.
 *
 * @param newState - The current state of the game board.
 * @param powerLevel - The level of power ("minor", "normal", or "mega").
 * @returns The updated state of the game board with an increased fall rate speed.
 */
function removePowers(newState: BoardState, powerLevel: PowerLevel): BoardState {
  const numPowersToRemove: number = powerLevel === "mega" ? 3 : powerLevel === "normal" ? 2 : 1

  // Remove power blocks from power bar
  const removedPowers: PowerBarBlock[] = []

  for (let i = 0; i < numPowersToRemove && newState.powerBar.length > 0; i++) {
    const powerBlock: PowerBarBlock = newState.powerBar.pop() as PowerBarBlock

    if (!isSpecialDiamond(powerBlock)) {
      removedPowers.push(powerBlock)
    }
  }

  // Place removed powers anywhere on the bottom row
  const bottomRow: BoardRow = newState.board[BOARD_ROWS - 1]

  removedPowers.forEach((powerBlock: PowerBarBlock) => {
    let colIndex: number
    do {
      colIndex = Math.floor(Math.random() * bottomRow.length)
    } while (!isTowersBlock(bottomRow[colIndex]))

    if (!isSpecialDiamond(powerBlock)) {
      newState.board[BOARD_ROWS - 1][colIndex] = powerBlock
    }
  })

  return newState
}

/**
 * Removes the least abundant color on the board. No different versions. Does not affect stones.
 *
 * @param newState - The current state of the game board.
 * @returns The updated state of the game board with an increased fall rate speed.
 */
function colorPlague(newState: BoardState): BoardState {
  // Count the occurrences of each color
  const countColors = (board: Board): Record<string, number> => {
    const colorCount: Record<string, number> = {}

    board.forEach((row: BoardRow) => {
      row.forEach((block: BoardBlock) => {
        if (isTowersBlock(block)) {
          colorCount[block.letter] = (colorCount[block.letter] || 0) + 1
        }
      })
    })

    return colorCount
  }

  // Count the occurrences of each color on the board
  const colorCount: Record<string, number> = countColors(newState.board)

  // Find the least abundant color
  let leastAbundantColor: string | null = null
  let leastCount: number = Infinity

  Object.entries(colorCount).forEach(([color, count]) => {
    if (count < leastCount) {
      leastCount = count
      leastAbundantColor = color
    }
  })

  // Remove the least abundant color from the board
  if (leastAbundantColor) {
    newState.board = newState.board.map((row: BoardRow) =>
      row.map((block: BoardBlock) => {
        if (isTowersBlock(block) && block.letter === leastAbundantColor) {
          return createEmptyCell() // Replace the color block with an empty cell
        }
        return block
      })
    )
  }

  // Shift down remaining blocks
  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = BOARD_ROWS - 1; row >= 0; row--) {
      if (isEmptyCell(newState.board[row][col])) {
        for (let upperRow = row - 1; upperRow >= 0; upperRow--) {
          if (!isEmptyCell(newState.board[upperRow][col])) {
            newState.board[row][col] = newState.board[upperRow][col]
            newState.board[upperRow][col] = createEmptyCell()
            break
          }
        }
      }
    }
  }

  return newState
}

/**
 * Increases the speed of one opponent's fall rate.
 *
 * @param newState - The current state of the game board.
 * @returns The updated state of the game board with an increased fall rate speed.
 */
function specialSpeedDrop(newState: BoardState): BoardState {
  return newState
}

/**
 * Removes all powers from an opponent's board and power bar.
 *
 * @param newState - The current state of the game board.
 * @returns The updated state of the game board with all powers removed.
 */
function specialRemovePowers(newState: BoardState): BoardState {
  const updatedBoard: BoardRow[] = newState.board.map((row: BoardRow) =>
    row.map((block: BoardBlock) => (isTowersBlock(block) ? createPieceBlock(block.letter) : block))
  )

  return {
    ...newState,
    board: updatedBoard,
    powerBar: []
  }
}

/**
 * Removes all stones from your board.
 *
 * @param newState - The current state of the game board.
 * @returns The updated state of the game board with all stones removed.
 */
function specialRemoveStones(newState: BoardState): BoardState {
  const updatedBoard: BoardRow[] = newState.board.map((row: BoardRow) =>
    row.map((block: BoardBlock) => (isMedusaBlock(block) ? createEmptyCell() : block))
  )

  // Shift down remaining blocks
  for (let col = 0; col < BOARD_COLS; col++) {
    let emptyCount: number = 0

    for (let row = updatedBoard.length - 1; row >= 0; row--) {
      if (isEmptyCell(updatedBoard[row][col])) {
        emptyCount++
      } else if (emptyCount > 0) {
        updatedBoard[row + emptyCount][col] = updatedBoard[row][col]
        updatedBoard[row][col] = createEmptyCell()
      }
    }
  }

  return {
    ...newState,
    board: updatedBoard
  }
}
