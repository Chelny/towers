import { act } from "react"
import { renderHook } from "@testing-library/react-hooks"
import { BOARD_ROWS, HIDDEN_ROWS_COUNT, PIECE_LENGTH, PIECE_STARTING_COL, PIECE_STARTING_ROW } from "@/constants/game"
import {
  boardReducer,
  checkGameOver,
  createPieceBlock,
  getEmptyBoard,
  getRandomPiece,
  hasCollisions,
  useTowersBoard
} from "@/hooks/useTowersBoard"
import { Board, BoardState, Piece } from "@/interfaces/game"

describe("useTowersBoard Hook", () => {
  it("should initialize board state with default values", () => {
    const { result } = renderHook(() => useTowersBoard())

    expect(result.current[0]).toEqual({
      board: getEmptyBoard(),
      droppingPiece: [
        { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
        { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
        { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null }
      ],
      droppingRow: PIECE_STARTING_ROW,
      droppingColumn: PIECE_STARTING_COL,
      powerBar: [],
      usedPowerBlock: null
    })
  })

  it("should start the game with a new piece and empty board", () => {
    const { result } = renderHook(() => useTowersBoard())

    act(() => {
      result.current[1]({ type: "start" })
    })

    expect(result.current[0].board).toEqual(getEmptyBoard())
    expect(result.current[0].droppingPiece).toHaveLength(PIECE_LENGTH)
  })

  it("should drop the piece down by one row", () => {
    const { result } = renderHook(() => useTowersBoard())

    act(() => {
      result.current[1]({ type: "drop" })
    })

    expect(result.current[0].droppingRow).toBe(PIECE_STARTING_ROW + 1)
  })

  it("should detect collisions correctly", () => {
    const board: Board = getEmptyBoard()
    const piece: Piece = getRandomPiece()

    board[0][0] = createPieceBlock("T")

    const collision: boolean = hasCollisions(board, piece, 0, 0)

    expect(collision).toBe(true)
  })

  it("should correctly determine if the game is over", () => {
    const board: Board = getEmptyBoard()
    const droppingRow: number = HIDDEN_ROWS_COUNT - 1
    const droppingColumn: number = PIECE_STARTING_COL

    board[0][droppingColumn] = createPieceBlock("T")

    const gameOver: boolean = checkGameOver(board, droppingRow, droppingColumn)

    expect(gameOver).toBe(true)
  })

  it("should commit a new piece and update the board", () => {
    const initialState: BoardState = {
      board: getEmptyBoard(),
      droppingPiece: getRandomPiece(),
      droppingRow: PIECE_STARTING_ROW,
      droppingColumn: PIECE_STARTING_COL,
      powerBar: [],
      usedPowerBlock: null
    }

    const newBoard: Board = getEmptyBoard()
    const newPiece: Piece = getRandomPiece()

    const newState: BoardState = boardReducer(initialState, {
      type: "commit",
      newBoard,
      newPiece
    })

    expect(newState.board).toEqual([...getEmptyBoard(BOARD_ROWS - newBoard.length), ...newBoard])
    expect(newState.droppingPiece).toEqual(newPiece)
  })
})
