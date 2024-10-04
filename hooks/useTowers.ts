import { useCallback, useEffect, useState } from "react"
import {
  BOARD_COLS,
  BOARD_ROWS,
  DIRECTIONS,
  HOO_SEQUENCE,
  MIN_MATCHING_BLOCKS,
  NUM_BROKEN_BLOCKS_FOR_POWER,
  NUM_BROKEN_BLOCKS_FOR_REMOVE_POWERS,
  NUM_BROKEN_BLOCKS_FOR_REMOVE_STONES,
  NUM_BROKEN_BLOCKS_FOR_SPEED_DROP,
  NUM_NEXT_PIECES,
  PIECE_LENGTH,
  PIECE_STARTING_COL,
  PIECE_STARTING_ROW
} from "@/constants/game"
import { TickSpeed } from "@/enums/tick-speed"
import { useInterval } from "@/hooks/useInterval"
import {
  checkGameOver,
  createEmptyCell,
  createMedusaBlock,
  createPieceBlock,
  getEmptyBoard,
  getMedusaPiece,
  getMidasPiece,
  getRandomPiece,
  hasCollisions,
  isInBounds,
  useTowersBoard
} from "@/hooks/useTowersBoard"
import {
  Block,
  BlockPosition,
  Board,
  BoardBlock,
  BoardCellPosition,
  MarkBlocksForDeletion,
  Piece,
  PowerBarBlock,
  PowerBlock,
  Powers,
  TowersLetter
} from "@/interfaces/game"
import {
  isEmptyCell,
  isMedusaBlock,
  isMidasBlock,
  isPowerBarBlock,
  isSpecialDiamond,
  isTowersBlock
} from "@/utils/block-guards-utils"

const cipherKeysMap: Record<string, string> = {
  A: "P",
  B: "6",
  C: "N",
  D: "X",
  E: "F",
  F: "E",
  G: "Z",
  H: "B",
  I: "G",
  J: "1",
  K: "L",
  L: "8",
  M: "U",
  N: "K",
  O: "R",
  P: "I",
  Q: "3",
  R: "W",
  S: "V",
  T: "9",
  U: "0",
  V: "M",
  W: "C",
  X: "4",
  Y: "5",
  Z: "7",
  "1": "O",
  "2": "T",
  "3": "D",
  "4": "Q",
  "5": "2",
  "6": "J",
  "7": "A",
  "8": "S",
  "9": "Y",
  "0": "H"
}

const INITIAL_POWERS_STATE: Powers = {
  T: { numBrokenBlocks: 0, powerType: null, powerLevel: null, isPowerToBeApplied: false },
  O: { numBrokenBlocks: 0, powerType: null, powerLevel: null, isPowerToBeApplied: false },
  W: { numBrokenBlocks: 0, powerType: null, powerLevel: null, isPowerToBeApplied: false },
  E: { numBrokenBlocks: 0, powerType: null, powerLevel: null, isPowerToBeApplied: false },
  R: { numBrokenBlocks: 0, powerType: null, powerLevel: null, isPowerToBeApplied: false },
  S: { numBrokenBlocks: 0, powerType: null, powerLevel: null, isPowerToBeApplied: false }
}

/**
 * Initializes the game state and starts the game.
 */
export function useTowers() {
  const [score, setScore] = useState<number>(0)
  const [nextPieces, setNextPieces] = useState<Piece[]>([])
  const [isCommitting, setIsCommitting] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null)
  const [isSpeedDropTriggered, setIsSpeedDropTriggered] = useState<boolean>(false)
  const [isSpeedDropActive, setIsSpeedDropActive] = useState<boolean>(false)
  const [isHooDetected, setIsHooDetected] = useState<boolean>(false)
  const [numFalls, setNumFalls] = useState<number>(0)
  const [_, setNumHoos] = useState<number>(0)
  const [totalBrokenBlocks, setTotalBrokenBlocks] = useState<number>(0)
  const [powers, setPowers] = useState<Powers>(INITIAL_POWERS_STATE)
  const [targetPlayer, setTargetPlayer] = useState<number | null>(null)
  const [lastMilestone, setLastMilestone] = useState<number>(0)

  const [{ board, droppingPiece, droppingRow, droppingColumn, powerBar, usedPowerBlock }, dispatchBoardState] =
    useTowersBoard()

  /**
   * Initializes the next pieces array with a specified number of random pieces.
   */
  const initializeNextPieces = (): void => {
    const pieces: Piece[] = []

    for (let i = 0; i < NUM_NEXT_PIECES; i++) {
      pieces.push(getRandomPiece())
    }

    setNextPieces(pieces)
  }

  /**
   * Adds a new piece to the end of the next pieces array.
   * If the array exceeds the specified length, the oldest piece is removed.
   *
   * @param newPiece - The new piece to add to the array.
   */
  const addNextPiece = (newPiece: Piece): void => {
    setNextPieces((prevPieces: Piece[]) => {
      const updatedPieces: Piece[] = [...prevPieces, newPiece]

      if (updatedPieces.length > NUM_NEXT_PIECES) {
        updatedPieces.shift()
      }

      return updatedPieces
    })
  }

  /**
   * Adds a special piece to the beginning of the next pieces array.
   * If the array exceeds the specified length, the oldest piece is removed.
   *
   * @param specialPiece - The special piece to add to the array.
   */
  const addSpecialPiece = (specialPiece: Piece): void => {
    setNextPieces((prevPieces: Piece[]) => {
      const updatedPieces: Piece[] = [specialPiece, ...prevPieces]

      if (updatedPieces.length > NUM_NEXT_PIECES) {
        updatedPieces.pop()
      }

      return updatedPieces
    })
  }

  /**
   * Applies the effect of a special piece to the game board. This includes converting adjacent blocks
   * to a specified type and removing the special piece from the board.
   *
   * @param board - The current game board represented as a 2D array of BoardCell.
   * @param row - The row position where the special piece has landed.
   * @param col - The column position where the special piece has landed.
   * @param createBlock - A function that creates the type of block to replace adjacent blocks with.
   * @param excludeCondition - A function that checks if a block should be excluded from conversion.
   */
  const applyPowerPieceToBoard = (
    board: Board,
    row: number,
    col: number,
    createBlock: () => BoardBlock,
    excludeCondition: (block: BoardBlock) => boolean
  ): void => {
    // Convert adjacent blocks based on the special piece’s effect
    for (let i = 0; i < PIECE_LENGTH; i++) {
      const pieceRow: number = row + i
      const pieceCol: number = col

      for (const dir of DIRECTIONS) {
        const adjRow: number = pieceRow + dir.row
        const adjCol: number = pieceCol + dir.col

        if (isInBounds(adjRow, adjCol)) {
          const block: Block = board[adjRow][adjCol]

          if (isTowersBlock(block) && !excludeCondition(block)) {
            // Convert the adjacent block
            board[adjRow][adjCol] = createBlock()
          }
        }
      }
    }

    // Remove the special piece from the board
    for (let i = 0; i < PIECE_LENGTH; i++) {
      const pieceRow: number = row + i
      const pieceCol: number = col

      if (isInBounds(pieceRow, pieceCol)) {
        board[pieceRow][pieceCol] = createEmptyCell()
      }
    }
  }

  /**
   * Sends a flashing three-piece of stones to your opponent.
   * Any adjacent pieces that it touches when it comes to rest turn into stones.
   *
   * @param board - The current game board represented as a 2D array of BoardCell.
   * @param row - The row position where the Medusa piece has landed.
   * @param col - The column position where the Medusa piece has landed.
   */
  const applyMedusaToBoard = (board: Board, row: number, col: number): void => {
    applyPowerPieceToBoard(board, row, col, createMedusaBlock, (cell: Block) => isMedusaBlock(cell))
  }

  /**
   * A half orange, half yellow three-piece twizzler falls. Any adjacent blocks it when it comes to rest turn yellow.
   * Stones are not affected. Yellow pieces formed are not sent during hoo attacks.
   *
   * @param board - The current game board represented as a 2D array of BoardCell.
   * @param row - The row position where the Midas piece has landed.
   * @param col - The column position where the Midas piece has landed.
   */
  const applyMidasToBoard = (board: Board, row: number, col: number): void => {
    applyPowerPieceToBoard(
      board,
      row,
      col,
      () => createPieceBlock("R"),
      (cell: Block) => isMedusaBlock(cell)
    )
  }

  /**
   * Marks and clears blocks on the board that match the deletion criteria.
   * This function identifies blocks for deletion based on matching criteria
   * and T-O-W-E-R-S sequences. After marking blocks, it slides remaining blocks
   * down and updates the board state accordingly. Recursively calls itself to
   * handle new matches after sliding blocks.
   *
   * @param board - The current game board.
   * @param powers - The current state of the powers.
   * @returns An object containing the positions of blocks to delete and the updated state of the powers.
   */
  const markBlocksForDeletion = useCallback(
    (board: Board, powers: Powers): MarkBlocksForDeletion => {
      const directions: BoardCellPosition[] = [
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
        { dx: 1, dy: -1 }
      ]
      const blocksToDelete: BlockPosition[] = []

      for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
          if (isTowersBlock(board[row][col])) {
            directions.forEach(({ dx, dy }: BoardCellPosition) => {
              checkDirection(board, row, col, dx, dy, blocksToDelete)
            })
          }
        }
      }

      blocksToDelete.forEach(({ row, col }: BlockPosition, index: number) => {
        if (isPowerBarBlock(board[row][col])) {
          const newPowerBarBlock: PowerBarBlock = board[row][col]
          dispatchBoardState({ type: "addToPowerBar", newAddedPowerBlock: newPowerBarBlock })
        }

        if (isTowersBlock(board[row][col])) {
          const blockLetter: TowersLetter = board[row][col].letter

          if (powers[blockLetter]) {
            powers = {
              ...powers,
              [blockLetter]: {
                ...powers[blockLetter],
                numBrokenBlocks: powers[blockLetter].numBrokenBlocks + 1
              }
            }
          }

          board[row][col] = {
            ...board[row][col],
            isToBeRemoved: true,
            brokenBlockNumber: isHooDetected ? index + 1 : null
          }

          setTimeout(() => {
            board[row][col] = createEmptyCell()
          }, TickSpeed.BREAKING_BLOCKS)

          setTotalBrokenBlocks((prevTotalBrokenBlocks: number) => prevTotalBrokenBlocks + 1)
          setScore((prevTotalBrokenBlocks: number) => prevTotalBrokenBlocks + 1)
        }
      })

      return { updatedPowers: powers, blocksToDelete }
    },
    [isHooDetected]
  )

  /**
   * Checks the game board in a specific direction from a given starting position
   * to identify and mark blocks for deletion. It looks for two types of sequences:
   * matching blocks of the same color and the specific T-O-W-E-R-S sequence.
   *
   * @param board - The current game board.
   * @param row - The starting row position for checking.
   * @param col - The starting column position for checking.
   * @param dx - The change in the x (column) direction.
   * @param dy - The change in the y (row) direction.
   * @param blocksToDelete - An array to store positions of blocks that need to be deleted.
   */
  const checkDirection = (
    board: Board,
    row: number,
    col: number,
    dx: number,
    dy: number,
    blocksToDelete: BlockPosition[]
  ): void => {
    const match: BlockPosition[] = []
    let r: number = row
    let c: number = col
    let sequence: string = ""

    const deleteBlocks = (blockPosition: BlockPosition[]): void => {
      blockPosition.forEach(({ row, col }: BlockPosition) => {
        blocksToDelete.push({ row, col })
      })
    }

    // Check for matching blocks in the current direction
    while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS && board[r][c].letter === board[row][col].letter) {
      match.push({ row: r, col: c })
      r += dy
      c += dx
    }

    // If there are at least 3 matching blocks, mark them for deletion
    if (match.length >= MIN_MATCHING_BLOCKS) deleteBlocks(match)

    // Check for matching T-O-W-E-R-S sequence
    r = row
    c = col
    let matchedSequence: BlockPosition[] = []

    while (
      r >= 0 &&
      r < BOARD_ROWS &&
      c >= 0 &&
      c < BOARD_COLS &&
      sequence.length < HOO_SEQUENCE.length &&
      board[r][c].letter === HOO_SEQUENCE.charAt(sequence.length)
    ) {
      sequence += board[r][c].letter
      matchedSequence.push({ row: r, col: c })
      r += dy
      c += dx
    }

    if (sequence === HOO_SEQUENCE) {
      let numFallsPerHoo: number = 0

      if ((dx === 1 && dy === 1) || (dx === 1 && dy === -1)) {
        numFallsPerHoo = 2 // Diagonal hoo
      } else if (dx === 0 && dy === 1) {
        numFallsPerHoo = 3 // Vertical hoo
      } else {
        numFallsPerHoo = 1 // Horizontal hoo
      }

      setNumHoos((prevNumHoos: number) => {
        const newNumHoos: number = prevNumHoos + 1
        const totalFalls: number = newNumHoos - 1 + numFallsPerHoo

        // Handle rainbow hoo detection
        if (isHooDetected) {
          deleteBlocks(matchedSequence)
          setIsHooDetected(false)
        } else {
          // Regular hoo detected
          setIsHooDetected(true)
        }

        setNumFalls((prevNumFalls: number) => prevNumFalls + totalFalls)

        return newNumHoos
      })

      // Add matched blocks to blocksToDelete array for regular hoo
      if (!isHooDetected) deleteBlocks(matchedSequence)
    }
  }

  /**
   * Clears empty cells and slides remaining blocks down to fill gaps on the board.
   * This function scans the board column by column from bottom to top, shifting blocks
   * down to fill any empty cells below them.
   *
   * @param board - The current game board.
   * @returns The updated game board with blocks slid down to fill empty cells.
   */
  const clearAndSlideBlocks = (board: Board): Board => {
    for (let col = 0; col < BOARD_COLS; col++) {
      for (let row = BOARD_ROWS - 1; row >= 0; row--) {
        if (isEmptyCell(board[row][col])) {
          let newRow: number = row

          while (newRow >= 0 && isEmptyCell(board[newRow][col])) {
            newRow--
          }

          if (newRow >= 0) {
            board[row][col] = board[newRow][col]
            board[newRow][col] = createEmptyCell()
          }
        }
      }
    }

    return board
  }

  /**
   * Add special diamonds to the power block based on the total number of broken blocks.
   * When a milestone for broken blocks is reached, it triggers the addition of specific
   * power block and updates the last milestone reached.
   *
   * @param totalBrokenBlocks - The total number of blocks broken so far.
   */
  const addSpecialDiamondToPowerBar = (totalBrokenBlocks: number): void => {
    if (totalBrokenBlocks >= NUM_BROKEN_BLOCKS_FOR_SPEED_DROP && lastMilestone < NUM_BROKEN_BLOCKS_FOR_SPEED_DROP) {
      // 50 broken blocks = Speed drop
      const specialDiamond: PowerBarBlock = { letter: "SD", specialDiamondType: "speed drop" }
      dispatchBoardState({ type: "addToPowerBar", newAddedPowerBlock: specialDiamond })
      setLastMilestone(NUM_BROKEN_BLOCKS_FOR_SPEED_DROP)
    } else if (
      totalBrokenBlocks >= NUM_BROKEN_BLOCKS_FOR_REMOVE_POWERS &&
      lastMilestone < NUM_BROKEN_BLOCKS_FOR_REMOVE_POWERS
    ) {
      // 100 broken blocks = Remove powers
      const specialDiamond: PowerBarBlock = { letter: "SD", specialDiamondType: "remove powers" }
      dispatchBoardState({ type: "addToPowerBar", newAddedPowerBlock: specialDiamond })
      setLastMilestone(NUM_BROKEN_BLOCKS_FOR_REMOVE_POWERS)
    } else if (
      totalBrokenBlocks >= NUM_BROKEN_BLOCKS_FOR_REMOVE_STONES &&
      lastMilestone < NUM_BROKEN_BLOCKS_FOR_REMOVE_STONES
    ) {
      // 150 broken blocks = Remove stones
      const specialDiamond: PowerBarBlock = { letter: "SD", specialDiamondType: "remove stones" }
      dispatchBoardState({ type: "addToPowerBar", newAddedPowerBlock: specialDiamond })
      setLastMilestone(NUM_BROKEN_BLOCKS_FOR_REMOVE_STONES)
    }
  }

  /**
   * Applies the effect of a Towers block power to the game board.
   *
   * @param powerBlock - The Towers block power to apply.
   */
  const applyTowersBlockPower = useCallback(
    (powerBlock: PowerBarBlock): void => {
      const { powerType, letter, powerLevel }: PowerBarBlock = powerBlock

      switch (letter) {
        case "T":
          if (powerType === "attack") {
            console.debug(`Add row for player ${targetPlayer ?? "random opponent"}`)
            dispatchBoardState({ type: "addRow" })
          } else {
            console.debug(`Remove row for player ${targetPlayer ?? "myself"}`)
            dispatchBoardState({ type: "removeRow" })
          }
          break
        case "O":
          if (powerType === "attack") {
            console.debug(`Dithering blocks for player ${targetPlayer ?? "random opponent"}`)
            dispatchBoardState({ type: "dither", powerLevel })
          } else {
            console.debug(`Clumping blocks for player ${targetPlayer ?? "myself"}`)
            dispatchBoardState({ type: "clump", powerLevel })
          }
          break
        case "W":
          if (powerType === "attack") {
            console.debug(`Adding stones to player ${targetPlayer ?? "random opponent"}`)
            dispatchBoardState({ type: "addStones", powerLevel })
          } else {
            console.debug(`Dropping stone for player ${targetPlayer ?? "myself"}`)
            dispatchBoardState({ type: "dropStones", powerLevel })
          }
          break
        case "E":
          if (powerType === "attack") {
            console.debug(`Defusing power for player ${targetPlayer ?? "random opponent"}`)
            dispatchBoardState({ type: "defuse", powerLevel })
          } else {
            console.debug(`Color blasting for player ${targetPlayer ?? "myself"}`)
            dispatchBoardState({ type: "colorBlast", powerLevel })
          }
          break
        case "R":
          if (powerType === "attack") {
            console.debug(`Sending Medusa piece to player ${targetPlayer ?? "random opponent"}`)
            addSpecialPiece(getMedusaPiece())
          } else {
            console.debug(`Sending Midas piece for player ${targetPlayer ?? "myself"}`)
            addSpecialPiece(getMidasPiece())
          }
          break
        case "S":
          if (powerType === "attack") {
            console.debug(`Removing powers from player ${targetPlayer ?? "random opponent"}`)
            dispatchBoardState({ type: "removePowers", powerLevel })
          } else {
            console.debug(`Applying color plague for player ${targetPlayer ?? "myself"}`)
            dispatchBoardState({ type: "colorPlague" })
          }
          break
        default:
          break
      }
    },
    [dispatchBoardState, targetPlayer]
  )

  /**
   * Applies the effect of a special diamond power to the game board.
   *
   * @param powerBlock - The power block containing the special diamond power.
   */
  const applySpecialDiamondPower = useCallback(
    (powerBlock: PowerBarBlock) => {
      switch (powerBlock.specialDiamondType) {
        case "speed drop":
          console.debug(`Applying speed drop effect to player ${targetPlayer ?? "myself"}`)
          setIsSpeedDropTriggered(true)
          break
        case "remove powers":
          console.debug(`Removing powers from player ${targetPlayer ?? "random opponent"}`)
          dispatchBoardState({ type: "specialRemovePowers" })
          break
        case "remove stones":
          console.debug(`Removing stones from player ${targetPlayer ?? "myself"}`)
          dispatchBoardState({ type: "specialRemoveStones" })
          break
        default:
          console.error(`Unknown special diamond type: ${powerBlock.specialDiamondType}`)
      }
    },
    [dispatchBoardState, targetPlayer]
  )

  /**
   * Starts a new game with initial settings.
   */
  const startGame = useCallback((): void => {
    setScore(0)
    initializeNextPieces()
    setIsCommitting(false)
    setIsPlaying(true)
    setIsGameOver(false)
    setTickSpeed(TickSpeed.NORMAL)
    setIsSpeedDropTriggered(false)
    setIsSpeedDropActive(false)
    setIsHooDetected(false)
    setNumFalls(0)
    setNumHoos(0)
    setTotalBrokenBlocks(0)
    setPowers(INITIAL_POWERS_STATE)
    setTargetPlayer(null)
    setLastMilestone(0)
    dispatchBoardState({ type: "start" })
  }, [dispatchBoardState])

  /**
   * Commits the current piece position to the board.
   * Handles collision detection, scoring, and board updates.
   */
  const commitPosition = useCallback((): void => {
    if (!hasCollisions(board, droppingPiece, droppingRow + 1, droppingColumn)) {
      setTickSpeed(isSpeedDropActive ? TickSpeed.SPEED_DROP : TickSpeed.NORMAL)
      setIsCommitting(false)
      return
    }

    let newBoard: Board = structuredClone(board)
    addPieceToBoard(newBoard, droppingPiece, droppingRow, droppingColumn)

    if (checkGameOver(newBoard, droppingRow, droppingColumn)) {
      setIsPlaying(false)
      setIsGameOver(true)
      setTickSpeed(null)

      dispatchBoardState({
        type: "commit",
        newBoard: [...getEmptyBoard(BOARD_ROWS - newBoard.length), ...newBoard],
        newPiece: droppingPiece
      })

      setIsCommitting(false)
      return
    }

    const isMedusaPiece: boolean = droppingPiece.every((block: Block) => isMedusaBlock(block))
    if (isMedusaPiece) applyMedusaToBoard(newBoard, droppingRow, droppingColumn)

    const isMidasPiece: boolean = droppingPiece.every((block: Block) => isMidasBlock(block))
    if (isMidasPiece) applyMidasToBoard(newBoard, droppingRow, droppingColumn)

    const processBoard = (board: Board, powers: Powers): void => {
      const { updatedPowers, blocksToDelete } = markBlocksForDeletion(board, powers)

      setPowers(updatedPowers)

      if (blocksToDelete.length > 0) {
        setTimeout(() => {
          const updatedBoard: Board = clearAndSlideBlocks(board)
          processBoard(updatedBoard, updatedPowers)
        }, TickSpeed.BREAKING_BLOCKS)
      }
    }

    processBoard(newBoard, powers)

    if (isHooDetected) {
      console.debug(`Sending attack to the other players with ${numFalls} falls`)
      setNumFalls((prevNumFalls: number) => (prevNumFalls > 0 ? prevNumFalls - 1 : 0))

      if (numFalls <= 1) {
        setIsHooDetected(false)
        setNumFalls(0)
        setNumHoos(0)
      }
    }

    const nextPiece: Piece = structuredClone(nextPieces).shift() as Piece
    addNextPiece(getRandomPiece(powers))

    if (hasCollisions(board, nextPiece, PIECE_STARTING_ROW, PIECE_STARTING_COL)) {
      setIsPlaying(false)
      setIsGameOver(true)
      setTickSpeed(null)
    } else {
      setTickSpeed(isSpeedDropActive ? TickSpeed.SPEED_DROP : TickSpeed.NORMAL)
    }

    dispatchBoardState({
      type: "commit",
      newBoard: [...getEmptyBoard(BOARD_ROWS - newBoard.length), ...newBoard],
      newPiece: nextPiece
    })

    setIsCommitting(false)
  }, [board, dispatchBoardState, droppingPiece, droppingRow, droppingColumn, nextPieces, powers])

  /**
   * Handles the game tick logic, including piece dropping and collision detection.
   * Triggers committing the piece position to the board when necessary.
   */
  const gameTick = useCallback((): void => {
    if (isCommitting) {
      commitPosition()
    } else if (hasCollisions(board, droppingPiece, droppingRow + 1, droppingColumn)) {
      setIsCommitting(true)
    } else {
      dispatchBoardState({ type: "drop" })
    }
  }, [board, commitPosition, dispatchBoardState, droppingPiece, droppingRow, droppingColumn, isCommitting])

  useInterval(() => {
    if (!isPlaying) return
    gameTick()
  }, tickSpeed)

  useEffect(() => {
    if (!isPlaying) return

    let isPressingLeft: boolean = false
    let isPressingRight: boolean = false
    let moveIntervalId: NodeJS.Timeout | undefined

    const updateMovementInterval = (): void => {
      clearInterval(moveIntervalId)
      dispatchBoardState({ type: "move", isPressingLeft, isPressingRight })
      moveIntervalId = setInterval(() => {
        dispatchBoardState({ type: "move", isPressingLeft, isPressingRight })
      }, 300)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      switch (event.key) {
        case "ArrowUp":
          dispatchBoardState({ type: "move", isRotating: true })
          break

        case "ArrowDown":
          setTickSpeed(isSpeedDropActive ? TickSpeed.SPEED_DROP : TickSpeed.DROP)
          break

        case "ArrowLeft":
          isPressingLeft = true
          updateMovementInterval()
          break

        case "ArrowRight":
          isPressingRight = true
          updateMovementInterval()
          break

        case " ": // Space bar
          dispatchBoardState({ type: "useItemFromPowerBar" })
          break

        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
          setTargetPlayer(+event.key)
          dispatchBoardState({ type: "useItemFromPowerBar" })
          break

        default:
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent): void => {
      switch (event.key) {
        case "ArrowDown":
          setTickSpeed(isSpeedDropActive ? TickSpeed.SPEED_DROP : TickSpeed.NORMAL)
          break

        case "ArrowLeft":
          isPressingLeft = false
          updateMovementInterval()
          break

        case "ArrowRight":
          isPressingRight = false
          updateMovementInterval()
          break

        default:
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      clearInterval(moveIntervalId)
    }
  }, [dispatchBoardState, isPlaying, isSpeedDropTriggered, nextPieces])

  useEffect(() => {
    // Towers keeps track of the number of blocks of each color you have broken. Whenever you have broken four blocks of any color, the next available three-piece will have a power of the same color and towers resets the count to zero. I will term this the rule of four from now on. The first power received is always an attack, the next is a defense and then the next is an attack and so on.
    for (const key in powers) {
      const blockLetter: TowersLetter = key as keyof Powers

      if (powers[blockLetter].numBrokenBlocks >= NUM_BROKEN_BLOCKS_FOR_POWER) {
        setPowers((prevPowers: Powers) => {
          const updatedPowers: Powers = { ...prevPowers }
          const { powerType: currentPowerType, powerLevel: currentPowerLevel }: PowerBlock = updatedPowers[blockLetter]

          if (currentPowerType === null && currentPowerLevel === null) {
            updatedPowers[blockLetter].powerType = "attack"
            updatedPowers[blockLetter].powerLevel = "minor"
          } else if (currentPowerType === "attack" && currentPowerLevel === "minor") {
            updatedPowers[blockLetter].powerType = "defense"
            updatedPowers[blockLetter].powerLevel = "minor"
          } else if (currentPowerType === "defense" && currentPowerLevel === "minor") {
            updatedPowers[blockLetter].powerType = "attack"
            updatedPowers[blockLetter].powerLevel = "normal"
          } else if (currentPowerType === "attack" && currentPowerLevel === "normal") {
            updatedPowers[blockLetter].powerType = "defense"
            updatedPowers[blockLetter].powerLevel = "normal"
          } else if (currentPowerType === "defense" && currentPowerLevel === "normal") {
            updatedPowers[blockLetter].powerType = "attack"
            updatedPowers[blockLetter].powerLevel = "mega"
          } else if (currentPowerType === "attack" && currentPowerLevel === "mega") {
            updatedPowers[blockLetter].powerType = "defense"
            updatedPowers[blockLetter].powerLevel = "mega"
          } else if (currentPowerType === "defense" && currentPowerLevel === "mega") {
            updatedPowers[blockLetter].powerType = "attack"
            updatedPowers[blockLetter].powerLevel = "mega"
          }

          updatedPowers[blockLetter].isPowerToBeApplied = true

          // Reset count after receiving power
          updatedPowers[blockLetter].numBrokenBlocks = 0

          return updatedPowers
        })
      }
    }
  }, [powers])

  useEffect(() => {
    if (totalBrokenBlocks > 0) {
      addSpecialDiamondToPowerBar(totalBrokenBlocks)
    }
  }, [totalBrokenBlocks])

  useEffect(() => {
    if (usedPowerBlock) {
      if (isTowersBlock(usedPowerBlock)) {
        applyTowersBlockPower(usedPowerBlock)
      }

      if (isSpecialDiamond(usedPowerBlock)) {
        applySpecialDiamondPower(usedPowerBlock)
      }
    }
  }, [usedPowerBlock])

  useEffect(() => {
    if (isSpeedDropTriggered) {
      setIsSpeedDropActive(true)
      setIsSpeedDropTriggered(false)
    }
  }, [isSpeedDropTriggered])

  useEffect(() => {
    if (isSpeedDropActive) {
      setTickSpeed(TickSpeed.SPEED_DROP)
      setIsSpeedDropActive(false)
    }
  }, [nextPieces])

  const updatedBoard: Board = structuredClone(board)

  if (isPlaying) {
    addPieceToBoard(updatedBoard, droppingPiece, droppingRow, droppingColumn)
  }

  return {
    board: updatedBoard,
    startGame,
    isPlaying,
    isGameOver,
    score,
    nextPieces,
    powerBar
  }
}

/**
 * Adds a dropping piece to the game board at a specified position.
 *
 * @param board - The game board to add the piece to.
 * @param droppingPiece - The piece being dropped onto the board.
 * @param droppingRow - The row position where the piece is being dropped.
 * @param droppingColumn - The column position where the piece is being dropped.
 */
function addPieceToBoard(board: Board, droppingPiece: Piece, droppingRow: number, droppingColumn: number): void {
  droppingPiece.forEach((block: BoardBlock, rowIndex: number) => {
    board[droppingRow + rowIndex][droppingColumn] = block
  })
}
