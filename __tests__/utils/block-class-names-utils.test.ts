import { MedusaBlock, MidasBlock, SpecialDiamond, TowersBlock } from "@/interfaces"
import { getClassNameForBlock, getClassNameForBlockPowerType } from "@/utils"

const defaultTowersBlockProps = {
  powerType: null,
  powerLevel: null,
  isToBeRemoved: false,
  brokenBlockNumber: null
}

describe("getClassNameForBlock Utility", () => {
  it("should return the correct class name for Towers block types", () => {
    const towersBlocks: TowersBlock[] = [
      { ...defaultTowersBlockProps, letter: "T" },
      { ...defaultTowersBlockProps, letter: "O" },
      { ...defaultTowersBlockProps, letter: "W" },
      { ...defaultTowersBlockProps, letter: "E" },
      { ...defaultTowersBlockProps, letter: "R" },
      { ...defaultTowersBlockProps, letter: "S" }
    ]
    const expectedClasses: string[] = ["BlockT", "BlockO", "BlockW", "BlockE", "BlockR", "BlockS"]

    towersBlocks.forEach((block: TowersBlock, index: number) => {
      expect(getClassNameForBlock(block)).toBe(expectedClasses[index])
    })
  })

  it("should return the correct class name for Medusa block", () => {
    const medusaBlock: MedusaBlock = { letter: "ME" }

    expect(getClassNameForBlock(medusaBlock)).toBe("BlockMedusa")
  })

  it("should return the correct class name for Midas block", () => {
    const midasBlock: MidasBlock = { letter: "MI" }

    expect(getClassNameForBlock(midasBlock)).toBe("BlockMidas")
  })

  it("should return an empty string for special diamond", () => {
    const specialDiamond: SpecialDiamond = { letter: "SD", specialDiamondType: "speed drop" }
    expect(getClassNameForBlock(specialDiamond)).toBe("")
  })
})

describe("getClassNameForBlockPowerType Utility", () => {
  it("should return the correct class name for attack power type", () => {
    const attackBlock: TowersBlock = {
      ...defaultTowersBlockProps,
      letter: "T",
      powerType: "attack",
      powerLevel: "minor"
    }

    expect(getClassNameForBlockPowerType(attackBlock)).toBe("AttackBlock")
  })

  it("should return the correct class name for defense power type", () => {
    const defenseBlock: TowersBlock = {
      ...defaultTowersBlockProps,
      letter: "T",
      powerType: "defense",
      powerLevel: "minor"
    }

    expect(getClassNameForBlockPowerType(defenseBlock)).toBe("DefenseBlock")
  })

  it("should return an empty string for unknown power types", () => {
    const unknownPowerTypeBlock: TowersBlock = {
      ...defaultTowersBlockProps,
      letter: "T"
    }

    expect(getClassNameForBlockPowerType(unknownPowerTypeBlock)).toBe("")
  })
})
