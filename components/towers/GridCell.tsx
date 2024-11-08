import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/towers/DefenseBlock"
import RegularBlock from "@/components/towers/RegularBlock"
import { BoardBlock } from "@/interfaces/game"
import { getClassNameForBlock, getClassNameForBlockPowerType } from "@/utils/block-class-names-utils"
import { isPowerPieceBlock, isTowersBlock } from "@/utils/block-guards-utils"
import styles from "./Block.module.scss"

type GridCellProps = {
  block: BoardBlock
  isOpponentBoard?: boolean
}

export default function GridCell(props: GridCellProps): ReactNode {
  return (
    <div
      className={clsx(
        "flex items-center justify-center box-border",
        props.isOpponentBoard ? "w-grid-cell-opponent h-grid-cell-opponent" : "w-grid-cell h-grid-cell",
        styles[getClassNameForBlock(props.block)],
        styles[getClassNameForBlockPowerType(props.block)],
        !props.isOpponentBoard && props.block.isToBeRemoved && !props.block.brokenBlockNumber && styles.BlockBreak,
        props.block.isToBeRemoved &&
          props.block.brokenBlockNumber &&
          styles[`BlockExplode-${props.block.brokenBlockNumber}`],
      )}
      role="gridcell"
    >
      {isTowersBlock(props.block) && props.block.powerType === "defense" ? (
        <DefenseBlock letter={props.isOpponentBoard ? undefined : props.block.letter} />
      ) : (
        <RegularBlock
          letter={isPowerPieceBlock(props.block) || props.isOpponentBoard ? undefined : props.block.letter}
        />
      )}
    </div>
  )
}
