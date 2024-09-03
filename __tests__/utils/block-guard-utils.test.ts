import { Block } from "@/interfaces"
import {
  isBoardBlock,
  isEmptyCell,
  isMedusaBlock,
  isMidasBlock,
  isPowerBarBlock,
  isPowerPieceBlock,
  isSpecialDiamond,
  isTowersBlock
} from "@/utils"

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

describe("isTowersBlock Utility", () => {
  it("should return true for towers block with valid letters", () => {
    const blocks: Block[] = [
      { ...defaultTowersBlockProps, letter: "T" },
      { ...defaultTowersBlockProps, letter: "O" },
      { ...defaultTowersBlockProps, letter: "W" },
      { ...defaultTowersBlockProps, letter: "E" },
      { ...defaultTowersBlockProps, letter: "R" },
      { ...defaultTowersBlockProps, letter: "S" }
    ]

    blocks.forEach((block: Block) => {
      expect(isTowersBlock(block)).toBe(true)
    })
  })

  it("should return false for non-towers block", () => {
    const blocks: Block[] = [{ letter: "ME" }, { letter: "MI" }, { letter: "SD", specialDiamondType: "speed drop" }]

    blocks.forEach((block: Block) => {
      expect(isTowersBlock(block)).toBe(false)
    })
  })
})

describe("isMedusaBlock Utility", () => {
  it("should return true for medusa block", () => {
    const block: Block = { letter: "ME" }
    expect(isMedusaBlock(block)).toBe(true)
  })

  it("should return false for non-medusa block", () => {
    const blocks: Block[] = [
      { ...defaultTowersBlockProps, letter: "T" },
      { letter: "MI" },
      { letter: "SD", specialDiamondType: "speed drop" }
    ]

    blocks.forEach((block: Block) => {
      expect(isMedusaBlock(block)).toBe(false)
    })
  })
})

describe("isMidasBlock Utility", () => {
  it("should return true for midas block", () => {
    const block: Block = { letter: "MI" }
    expect(isMidasBlock(block)).toBe(true)
  })

  it("should return false for non-midas block", () => {
    const blocks: Block[] = [
      { ...defaultTowersBlockProps, letter: "T" },
      { letter: "ME" },
      { letter: "SD", specialDiamondType: "speed drop" }
    ]

    blocks.forEach((block: Block) => {
      expect(isMidasBlock(block)).toBe(false)
    })
  })
})

describe("isSpecialDiamond Utility", () => {
  it("should return true for special diamond", () => {
    const block: Block = { letter: "SD", specialDiamondType: "speed drop" }
    expect(isSpecialDiamond(block)).toBe(true)
  })

  it("should return false for non-special diamond", () => {
    const blocks: Block[] = [{ ...defaultTowersBlockProps, letter: "T" }, { letter: "MI" }, { letter: "ME" }]

    blocks.forEach((block: Block) => {
      expect(isSpecialDiamond(block)).toBe(false)
    })
  })
})

describe("isBoardBlock Utility", () => {
  it("should return true for board block", () => {
    const blocks: Block[] = [{ ...defaultTowersBlockProps, letter: "T" }, { letter: "ME" }, { letter: "MI" }]

    blocks.forEach((block: Block) => {
      expect(isBoardBlock(block)).toBe(true)
    })
  })

  it("should return false for non-board block", () => {
    const blocks: Block[] = [{ letter: "SD", specialDiamondType: "speed drop" }]

    blocks.forEach((block: Block) => {
      expect(isBoardBlock(block)).toBe(false)
    })
  })
})

describe("isPowerPieceBlock Utility", () => {
  it("should return true for power piece block", () => {
    const blocks: Block[] = [{ letter: "ME" }, { letter: "MI" }]

    blocks.forEach((block: Block) => {
      expect(isPowerPieceBlock(block)).toBe(true)
    })
  })

  it("should return false for non-power piece block", () => {
    const blocks: Block[] = [
      { ...defaultTowersBlockProps, letter: "T" },
      { letter: "SD", specialDiamondType: "speed drop" }
    ]

    blocks.forEach((block: Block) => {
      expect(isPowerPieceBlock(block)).toBe(false)
    })
  })
})

describe("isPowerBarBlock Utility", () => {
  it("should return true for power bar block with non-null powerType", () => {
    const blocks: Block[] = [
      { ...defaultTowersBlockProps, letter: "T", powerType: "attack" },
      { letter: "SD", specialDiamondType: "speed drop" }
    ]

    blocks.forEach((block: Block) => {
      expect(isPowerBarBlock(block)).toBe(true)
    })
  })

  it("should return false for non-power bar block", () => {
    const blocks: Block[] = [{ ...defaultTowersBlockProps, letter: "T" }, { letter: "ME" }]

    blocks.forEach((block: Block) => {
      expect(isPowerBarBlock(block)).toBe(false)
    })
  })
})

describe("isEmptyCell Utility", () => {
  it("should return true for empty cell", () => {
    const block: Block = { letter: " " }
    expect(isEmptyCell(block)).toBe(true)
  })

  it("should return false for non-empty cell", () => {
    const blocks: Block[] = [
      { ...defaultTowersBlockProps, letter: "T" },
      { letter: "ME" },
      { letter: "MI" },
      { letter: "SD", specialDiamondType: "speed drop" }
    ]

    blocks.forEach((block: Block) => {
      expect(isEmptyCell(block)).toBe(false)
    })
  })
})
