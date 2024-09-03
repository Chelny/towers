import { Block, BoardBlock, BoardRow } from "@/interfaces"
import { areAdjacentBlocksSame, getNumBlocksToRearrange, isSettingUpThreeInRow } from "@/utils"

vi.mock(import("@/utils"), async (importOriginal) => {
  const actual = await importOriginal()
  return actual
})

const defaultTowersBlockProps = {
  powerType: null,
  powerLevel: null,
  isToBeRemoved: false,
  brokenBlockNumber: null
}

const blockT: Block = { ...defaultTowersBlockProps, letter: "T" }
const blockO: Block = { ...defaultTowersBlockProps, letter: "O" }
const blockW: Block = { ...defaultTowersBlockProps, letter: "W" }
const blockE: Block = { ...defaultTowersBlockProps, letter: "E" }
const blockR: Block = { ...defaultTowersBlockProps, letter: "R" }
const blockS: Block = { ...defaultTowersBlockProps, letter: "S" }
const blockMedusa: Block = { letter: "ME" }
const blockEmpty: Block = { letter: " " }

describe("areAdjacentBlocksSame Utility", () => {
  const board: BoardRow[] = [
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 0 (hidden to user)
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 1 (hidden to user)
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 2
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 3
    [blockT, blockO, blockW, blockEmpty, blockR, blockMedusa], // Row 4
    [blockS, blockMedusa, blockT, blockW, blockO, blockR], // Row 5
    [blockR, blockE, blockMedusa, blockS, blockT, blockO], // Row 6
    [blockO, blockR, blockS, blockMedusa, blockE, blockT], // Row 7
    [blockW, blockT, blockO, blockMedusa, blockS, blockMedusa], // Row 8
    [blockMedusa, blockW, blockT, blockO, blockR, blockS], // Row 9
    [blockS, blockE, blockW, blockT, blockO, blockR], // Row 10
    [blockR, blockO, blockMedusa, blockW, blockT, blockO], // Row 11
    [blockO, blockR, blockS, blockMedusa, blockW, blockT], // Row 12
    [blockW, blockO, blockR, blockS, blockR, blockT], // Row 13
    [blockT, blockW, blockT, blockE, blockT, blockMedusa] // Row 14
  ]

  it("should return true if swapping creates horizontally adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(board, 6, 4, 6, 5)).toBe(true)
  })

  it("should return true if swapping creates vertically adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(board, 11, 5, 12, 5)).toBe(true)
  })

  it("should return false if swapping does not create adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(board, 14, 3, 13, 3)).toBe(false)
  })
})

describe("isSettingUpThreeInRow Utility", () => {
  const board: BoardRow[] = [
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 0 (hidden to user)
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 1 (hidden to user)
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 2
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 3
    [blockT, blockO, blockW, blockEmpty, blockR, blockMedusa], // Row 4
    [blockS, blockMedusa, blockT, blockW, blockO, blockR], // Row 5
    [blockR, blockE, blockMedusa, blockS, blockT, blockO], // Row 6
    [blockO, blockR, blockS, blockMedusa, blockE, blockT], // Row 7
    [blockW, blockT, blockO, blockMedusa, blockS, blockMedusa], // Row 8
    [blockMedusa, blockW, blockT, blockO, blockR, blockS], // Row 9
    [blockS, blockE, blockW, blockT, blockO, blockR], // Row 10
    [blockR, blockO, blockMedusa, blockW, blockT, blockO], // Row 11
    [blockR, blockR, blockS, blockMedusa, blockW, blockT], // Row 12
    [blockW, blockR, blockR, blockS, blockR, blockT], // Row 13
    [blockT, blockW, blockT, blockE, blockT, blockMedusa] // Row 14
  ]

  it("should return true if swapping sets up three blocks in a row horizontally", () => {
    expect(isSettingUpThreeInRow(board, 13, 2, 12, 2)).toBe(true)
  })

  it("should return true if swapping sets up three blocks in a row vertically", () => {
    expect(isSettingUpThreeInRow(board, 13, 0, 13, 1)).toBe(true)
  })

  it("should return false if swapping does not set up three blocks in a row", () => {
    expect(isSettingUpThreeInRow(board, 7, 2, 8, 2)).toBe(false)
  })
})

describe("getNumBlocksToRearrange Utility", () => {
  const board: BoardRow[] = [
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 0 (hidden to user)
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 1 (hidden to user)
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 2
    [blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty, blockEmpty], // Row 3
    [blockT, blockO, blockW, blockEmpty, blockR, blockMedusa], // Row 4
    [blockS, blockE, blockT, blockW, blockO, blockR], // Row 5
    [blockR, blockE, blockMedusa, blockS, blockT, blockO], // Row 6
    [blockO, blockR, blockS, blockMedusa, blockE, blockT], // Row 7
    [blockE, blockT, blockO, blockMedusa, blockS, blockMedusa], // Row 8
    [blockMedusa, blockW, blockT, blockO, blockR, blockS], // Row 9
    [blockS, blockE, blockW, blockT, blockO, blockR], // Row 10
    [blockR, blockO, blockMedusa, blockW, blockT, blockO], // Row 11
    [blockO, blockR, blockS, blockE, blockW, blockT], // Row 12
    [blockW, blockO, blockR, blockS, blockR, blockT], // Row 13
    [blockT, blockW, blockT, blockE, blockT, blockMedusa] // Row 14
  ]
  const blockECount: number = board.flat().filter((block: BoardBlock) => block.letter === blockE.letter).length

  it("should return the correct number of blocks to rearrange to set up three blocks based on minor power level", () => {
    expect(getNumBlocksToRearrange(board, "minor")).toBe(6)
  })

  it("should return the correct number of blocks to rearrange to set up three blocks based on normal power level", () => {
    expect(getNumBlocksToRearrange(board, "normal")).toBe(15)
  })

  it("should return the correct number of blocks to rearrange to set up three blocks based on mega power level", () => {
    expect(getNumBlocksToRearrange(board, "mega")).toBe(29)
  })

  it("should return the correct number of purple powers to defuse based on minor power level", () => {
    expect(getNumBlocksToRearrange(board, "minor", blockECount)).toBe(1)
  })

  it("should return the correct number of purple powers to defuse based on normal power level", () => {
    expect(getNumBlocksToRearrange(board, "normal", blockECount)).toBe(2)
  })

  it("should return the correct number of purple powers to defuse based on mega power level", () => {
    expect(getNumBlocksToRearrange(board, "mega", blockECount)).toBe(4)
  })
})
