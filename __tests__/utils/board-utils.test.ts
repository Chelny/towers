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
import { Board, BoardBlock } from "@/interfaces/game"
import { areAdjacentBlocksSame, getNumBlocksToRearrange, isSettingUpThreeInRow } from "@/utils/board-utils"

describe("areAdjacentBlocksSame Utility", () => {
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

  it("should return true if swapping creates horizontally adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(mockBoard, 6, 4, 6, 5)).toBe(true)
  })

  it("should return true if swapping creates vertically adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(mockBoard, 11, 5, 12, 5)).toBe(true)
  })

  it("should return false if swapping does not create adjacent blocks with the same letter", () => {
    expect(areAdjacentBlocksSame(mockBoard, 14, 3, 13, 3)).toBe(false)
  })
})

describe("isSettingUpThreeInRow Utility", () => {
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
    [mockBlockR, mockBlockR, mockBlockS, mockBlockMedusa, mockBlockW, mockBlockT], // Row 12
    [mockBlockW, mockBlockR, mockBlockR, mockBlockS, mockBlockR, mockBlockT], // Row 13
    [mockBlockT, mockBlockW, mockBlockT, mockBlockE, mockBlockT, mockBlockMedusa] // Row 14
  ]

  it("should return true if swapping sets up three blocks in a row horizontally", () => {
    expect(isSettingUpThreeInRow(mockBoard, 13, 2, 12, 2)).toBe(true)
  })

  it("should return true if swapping sets up three blocks in a row vertically", () => {
    expect(isSettingUpThreeInRow(mockBoard, 13, 0, 13, 1)).toBe(true)
  })

  it("should return false if swapping does not set up three blocks in a row", () => {
    expect(isSettingUpThreeInRow(mockBoard, 7, 2, 8, 2)).toBe(false)
  })
})

describe("getNumBlocksToRearrange Utility", () => {
  const mockBoard: Board = [
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 0 (hidden to user)
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 1 (hidden to user)
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 2
    [mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty, mockBlockEmpty], // Row 3
    [mockBlockT, mockBlockO, mockBlockW, mockBlockEmpty, mockBlockR, mockBlockMedusa], // Row 4
    [mockBlockS, mockBlockE, mockBlockT, mockBlockW, mockBlockO, mockBlockR], // Row 5
    [mockBlockR, mockBlockE, mockBlockMedusa, mockBlockS, mockBlockT, mockBlockO], // Row 6
    [mockBlockO, mockBlockR, mockBlockS, mockBlockMedusa, mockBlockE, mockBlockT], // Row 7
    [mockBlockE, mockBlockT, mockBlockO, mockBlockMedusa, mockBlockS, mockBlockMedusa], // Row 8
    [mockBlockMedusa, mockBlockW, mockBlockT, mockBlockO, mockBlockR, mockBlockS], // Row 9
    [mockBlockS, mockBlockE, mockBlockW, mockBlockT, mockBlockO, mockBlockR], // Row 10
    [mockBlockR, mockBlockO, mockBlockMedusa, mockBlockW, mockBlockT, mockBlockO], // Row 11
    [mockBlockO, mockBlockR, mockBlockS, mockBlockE, mockBlockW, mockBlockT], // Row 12
    [mockBlockW, mockBlockO, mockBlockR, mockBlockS, mockBlockR, mockBlockT], // Row 13
    [mockBlockT, mockBlockW, mockBlockT, mockBlockE, mockBlockT, mockBlockMedusa] // Row 14
  ]
  const mockBlockECount: number = mockBoard
    .flat()
    .filter((block: BoardBlock) => block.letter === mockBlockE.letter).length

  it("should return the correct number of blocks to rearrange to set up three blocks based on minor power level", () => {
    expect(getNumBlocksToRearrange(mockBoard, "minor")).toBe(6)
  })

  it("should return the correct number of blocks to rearrange to set up three blocks based on normal power level", () => {
    expect(getNumBlocksToRearrange(mockBoard, "normal")).toBe(15)
  })

  it("should return the correct number of blocks to rearrange to set up three blocks based on mega power level", () => {
    expect(getNumBlocksToRearrange(mockBoard, "mega")).toBe(29)
  })

  it("should return the correct number of purple powers to defuse based on minor power level", () => {
    expect(getNumBlocksToRearrange(mockBoard, "minor", mockBlockECount)).toBe(1)
  })

  it("should return the correct number of purple powers to defuse based on normal power level", () => {
    expect(getNumBlocksToRearrange(mockBoard, "normal", mockBlockECount)).toBe(2)
  })

  it("should return the correct number of purple powers to defuse based on mega power level", () => {
    expect(getNumBlocksToRearrange(mockBoard, "mega", mockBlockECount)).toBe(4)
  })
})
