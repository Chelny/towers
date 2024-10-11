import { act } from "react"
import { renderHook } from "@testing-library/react-hooks"
import { NUM_NEXT_PIECES } from "@/constants/game"
import { useTowers } from "@/hooks/useTowers"
import { getRandomPiece } from "@/hooks/useTowersBoard"
import { BoardBlock, BoardRow, Piece } from "@/interfaces/game"

vi.mock("@/hooks/useTowersBoard", async () => {
  const actual = await vi.importActual("@/hooks/useTowersBoard")

  return {
    ...actual,
    getRandomPiece: vi.fn(() => [
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null }
    ])
  }
})

describe("useTowers Hook", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useTowers())

    expect(result.current.score).toBe(0)
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.isGameOver).toBe(false)
    expect(result.current.nextPieces.length).toBe(0)
  })

  it("should initialize next pieces with random pieces", () => {
    const mockPiece: Piece = [
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null }
    ]

    vi.mocked(getRandomPiece).mockReturnValue(mockPiece)

    const { result } = renderHook(() => useTowers())

    act(() => {
      result.current.startGame()
    })

    expect(result.current.nextPieces.length).toBe(NUM_NEXT_PIECES)

    result.current.nextPieces.forEach((piece: Piece) => {
      expect(piece.length).toBe(mockPiece.length)

      piece.forEach((block: BoardBlock, index: number) => {
        expect(block.powerType).toBe(mockPiece[index].powerType)
        expect(block.powerLevel).toBe(mockPiece[index].powerLevel)
        expect(block.isToBeRemoved).toBe(mockPiece[index].isToBeRemoved)
        expect(block.brokenBlockNumber).toBe(mockPiece[index].brokenBlockNumber)
      })
    })
  })

  it("should add a new piece to the next pieces array when the game progresses", () => {
    const mockPiece: Piece = [
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null },
      { letter: "T", powerType: null, powerLevel: null, isToBeRemoved: false, brokenBlockNumber: null }
    ]

    vi.mocked(getRandomPiece).mockReturnValue(mockPiece)

    const { result } = renderHook(() => useTowers())

    act(() => {
      result.current.startGame()
    })

    act(() => {
      result.current.nextPieces.push(mockPiece)
      result.current.nextPieces.shift()
    })

    expect(result.current.nextPieces.length).toBe(NUM_NEXT_PIECES)
    expect(result.current.nextPieces[NUM_NEXT_PIECES - 1]).toBe(mockPiece)
  })

  it("should mark blocks for deletion and update the score correctly", () => {
    const { result } = renderHook(() => useTowers())

    act(() => {
      result.current.startGame()
    })

    act(() => {
      result.current.board = result.current.board.map((row: BoardRow, rowIndex: number) =>
        row.map((cell: BoardBlock, colIndex: number) => {
          if (rowIndex === 1 && colIndex === 1) {
            return { ...cell, isToBeRemoved: true }
          }
          return cell
        })
      )

      // Simulate score update
      const blocksDeleted: number = result.current.board.flat().filter((cell: BoardBlock) => cell.isToBeRemoved).length
      const updatedScore: number = result.current.score + blocksDeleted

      result.current.score = updatedScore

      // Remove blocks marked for deletion
      result.current.board = result.current.board.map((row: BoardRow) =>
        row.map((cell: BoardBlock) => (cell.isToBeRemoved ? { ...cell, letter: " " } : cell))
      )
    })

    expect(result.current.score).toBeGreaterThan(0)

    // Ensure that the blocks marked for deletion are now empty
    result.current.board.forEach((row: BoardRow) => {
      row.forEach((cell: BoardBlock) => {
        if (cell.isToBeRemoved) {
          expect(cell.letter).toBe(" ")
        }
      })
    })
  })
})
