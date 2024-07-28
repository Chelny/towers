import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/game/DefenseBlock"
import RegularBlock from "@/components/game/RegularBlock"
import { Block, Piece } from "@/interfaces"
import { getClassNameForBlock, getClassNameForBlockPowerType, isPowerPieceBlock, isTowersBlock } from "@/utils"
import styles from "./Block.module.scss"

type NextPieceProps = {
  nextPiece: Piece
}

export default function NextPiece(props: NextPieceProps): ReactNode {
  return (
    <>
      {props.nextPiece?.map((block: Block, blockIndex: number) => (
        <div
          key={blockIndex}
          className={clsx(
            "w-grid-cell h-grid-cell box-border text-center",
            styles[getClassNameForBlock(block)],
            styles[getClassNameForBlockPowerType(block)]
          )}
        >
          {isTowersBlock(block) && block.powerType === "defense" ? (
            <DefenseBlock letter={block.letter} />
          ) : (
            <RegularBlock letter={isPowerPieceBlock(block) ? undefined : block.letter} />
          )}
        </div>
      ))}
    </>
  )
}
