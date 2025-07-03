import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/towers/DefenseBlock"
import RegularBlock from "@/components/towers/RegularBlock"
import { BoardBlock } from "@/interfaces/towers"
import {
  getBlockRemovalAnimationClass,
  getClassNameForBlock,
  getClassNameForBlockPowerType,
} from "@/utils/block-class-names-utils"
import { isTowersPieceBlock } from "@/utils/block-guards-utils"

type GridCellProps = {
  block: BoardBlock
  isOpponentBoard?: boolean
}

export default function GridCell({ block, isOpponentBoard = false }: GridCellProps): ReactNode {
  return (
    <div
      className={clsx(
        "flex items-center justify-center box-border",
        isOpponentBoard ? "opponent-cell w-grid-cell-opponent h-grid-cell-opponent" : "w-grid-cell h-grid-cell",
        getClassNameForBlock(block),
        getClassNameForBlockPowerType(block),
        getBlockRemovalAnimationClass(block),
      )}
      role="gridcell"
    >
      {isTowersPieceBlock(block) && block.powerType === "defense" ? (
        <DefenseBlock letter={isTowersPieceBlock(block) && !isOpponentBoard ? block.letter : undefined} />
      ) : (
        <RegularBlock letter={isTowersPieceBlock(block) && !isOpponentBoard ? block.letter : undefined} />
      )}
    </div>
  )
}
