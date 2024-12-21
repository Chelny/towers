import { Block } from "@/interfaces/game"
import { isMedusaBlock, isMidasBlock, isTowersBlock } from "@/utils/block-guards-utils"

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
        return "block-t"
      case "O":
        return "block-o"
      case "W":
        return "block-w"
      case "E":
        return "block-e"
      case "R":
        return "block-r"
      case "S":
        return "block-s"
      default:
        return ""
    }
  } else if (isMedusaBlock(block)) {
    return "block-medusa"
  } else if (isMidasBlock(block)) {
    return "block-midas"
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
      return "attack-block"
    case "defense":
      return "defense-block"
    default:
      return ""
  }
}
