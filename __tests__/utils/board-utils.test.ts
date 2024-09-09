import { Board, BoardBlock } from "@/interfaces"
import { areAdjacentBlocksSame, getNumBlocksToRearrange, isSettingUpThreeInRow } from "@/utils"
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

describe("areAdjacentBlocksSame Utility", () => {
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

  it("should return true if swapping creates horizontally adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(mockedBoard, 6, 4, 6, 5)).toBe(true)
  })

  it("should return true if swapping creates vertically adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(mockedBoard, 11, 5, 12, 5)).toBe(true)
  })

  it("should return false if swapping does not create adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(mockedBoard, 14, 3, 13, 3)).toBe(false)
  })
})

describe("isSettingUpThreeInRow Utility", () => {
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
    [mockedBlockR, mockedBlockR, mockedBlockS, mockedBlockMedusa, mockedBlockW, mockedBlockT], // Row 12
    [mockedBlockW, mockedBlockR, mockedBlockR, mockedBlockS, mockedBlockR, mockedBlockT], // Row 13
    [mockedBlockT, mockedBlockW, mockedBlockT, mockedBlockE, mockedBlockT, mockedBlockMedusa] // Row 14
  ]

  it("should return true if swapping sets up three blocks in a row horizontally", () => {
    expect(isSettingUpThreeInRow(mockedBoard, 13, 2, 12, 2)).toBe(true)
  })

  it("should return true if swapping sets up three blocks in a row vertically", () => {
    expect(isSettingUpThreeInRow(mockedBoard, 13, 0, 13, 1)).toBe(true)
  })

  it("should return false if swapping does not set up three blocks in a row", () => {
    expect(isSettingUpThreeInRow(mockedBoard, 7, 2, 8, 2)).toBe(false)
  })
})

describe("getNumBlocksToRearrange Utility", () => {
  const mockedBoard: Board = [
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 0 (hidden to user)
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 1 (hidden to user)
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 2
    [mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty, mockedBlockEmpty], // Row 3
    [mockedBlockT, mockedBlockO, mockedBlockW, mockedBlockEmpty, mockedBlockR, mockedBlockMedusa], // Row 4
    [mockedBlockS, mockedBlockE, mockedBlockT, mockedBlockW, mockedBlockO, mockedBlockR], // Row 5
    [mockedBlockR, mockedBlockE, mockedBlockMedusa, mockedBlockS, mockedBlockT, mockedBlockO], // Row 6
    [mockedBlockO, mockedBlockR, mockedBlockS, mockedBlockMedusa, mockedBlockE, mockedBlockT], // Row 7
    [mockedBlockE, mockedBlockT, mockedBlockO, mockedBlockMedusa, mockedBlockS, mockedBlockMedusa], // Row 8
    [mockedBlockMedusa, mockedBlockW, mockedBlockT, mockedBlockO, mockedBlockR, mockedBlockS], // Row 9
    [mockedBlockS, mockedBlockE, mockedBlockW, mockedBlockT, mockedBlockO, mockedBlockR], // Row 10
    [mockedBlockR, mockedBlockO, mockedBlockMedusa, mockedBlockW, mockedBlockT, mockedBlockO], // Row 11
    [mockedBlockO, mockedBlockR, mockedBlockS, mockedBlockE, mockedBlockW, mockedBlockT], // Row 12
    [mockedBlockW, mockedBlockO, mockedBlockR, mockedBlockS, mockedBlockR, mockedBlockT], // Row 13
    [mockedBlockT, mockedBlockW, mockedBlockT, mockedBlockE, mockedBlockT, mockedBlockMedusa] // Row 14
  ]
  const mockedBlockECount: number = mockedBoard
    .flat()
    .filter((block: BoardBlock) => block.letter === mockedBlockE.letter).length

  it("should return the correct number of blocks to rearrange to set up three blocks based on minor power level", () => {
    expect(getNumBlocksToRearrange(mockedBoard, "minor")).toBe(6)
  })

  it("should return the correct number of blocks to rearrange to set up three blocks based on normal power level", () => {
    expect(getNumBlocksToRearrange(mockedBoard, "normal")).toBe(15)
  })

  it("should return the correct number of blocks to rearrange to set up three blocks based on mega power level", () => {
    expect(getNumBlocksToRearrange(mockedBoard, "mega")).toBe(29)
  })

  it("should return the correct number of purple powers to defuse based on minor power level", () => {
    expect(getNumBlocksToRearrange(mockedBoard, "minor", mockedBlockECount)).toBe(1)
  })

  it("should return the correct number of purple powers to defuse based on normal power level", () => {
    expect(getNumBlocksToRearrange(mockedBoard, "normal", mockedBlockECount)).toBe(2)
  })

  it("should return the correct number of purple powers to defuse based on mega power level", () => {
    expect(getNumBlocksToRearrange(mockedBoard, "mega", mockedBlockECount)).toBe(4)
  })
})
