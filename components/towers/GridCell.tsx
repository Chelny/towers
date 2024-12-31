import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/towers/DefenseBlock"
import RegularBlock from "@/components/towers/RegularBlock"
import { BoardBlock } from "@/interfaces/game"
import { getClassNameForBlock, getClassNameForBlockPowerType } from "@/utils/block-class-names-utils"
import { isPowerPieceBlock, isTowersBlock } from "@/utils/block-guards-utils"

type GridCellProps = {
  block: BoardBlock
  isOpponentBoard?: boolean
}

export default function GridCell({ block, isOpponentBoard }: GridCellProps): ReactNode {
  return (
    <div
      className={clsx(
        "flex items-center justify-center box-border",
        isOpponentBoard ? "w-grid-cell-opponent h-grid-cell-opponent" : "w-grid-cell h-grid-cell",
        getClassNameForBlock(block),
        getClassNameForBlockPowerType(block),
        !isOpponentBoard && block.isToBeRemoved && !block.brokenBlockNumber && "block-break",
        block.isToBeRemoved && block.brokenBlockNumber && `block-explode-${block.brokenBlockNumber}`,
      )}
      role="gridcell"
    >
      {isTowersBlock(block) && block.powerType === "defense" ? (
        <DefenseBlock letter={isOpponentBoard ? undefined : block.letter} />
      ) : (
        <RegularBlock letter={isPowerPieceBlock(block) || isOpponentBoard ? undefined : block.letter} />
      )}
    </div>
  )
}
