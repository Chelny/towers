import { Block } from "@/interfaces"
import { isMedusaBlock, isMidasBlock, isTowersBlock } from "@/utils"

/**
 * Returns the CSS class name corresponding to a given block type for styling purposes.
 *
 * @param block - Block type identifier.
 * @returns CSS class name associated with the block type.
 */
export const getClassNameForBlock = (block: Block): string => {
  if (isTowersBlock(block)) {
    switch (block.letter) {
      case "T":
        return "BlockT"
      case "O":
        return "BlockO"
      case "W":
        return "BlockW"
      case "E":
        return "BlockE"
      case "R":
        return "BlockR"
      case "S":
        return "BlockS"
      default:
        return ""
    }
  } else if (isMedusaBlock(block)) {
    return "BlockMedusa"
  } else if (isMidasBlock(block)) {
    return "BlockMidas"
  } else {
    return ""
  }
}

/**
 * Returns the CSS class name corresponding to a given block power type for styling purposes.
 *
 * @param block - Block type identifier.
 * @returns CSS class name associated with the block power type.
 */
export const getClassNameForBlockPowerType = (block: Block): string => {
  switch (block.powerType) {
    case "attack":
      return "AttackBlock"
    case "defense":
      return "DefenseBlock"
    default:
      return ""
  }
}
