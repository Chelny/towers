import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/towers/DefenseBlock"
import RegularBlock from "@/components/towers/RegularBlock"
import { Block, Piece } from "@/interfaces/game"
import { getClassNameForBlock, getClassNameForBlockPowerType } from "@/utils/block-class-names-utils"
import { isPowerPieceBlock, isTowersBlock } from "@/utils/block-guards-utils"

type NextPieceProps = {
  nextPiece: Piece
}

export default function NextPiece({ nextPiece }: NextPieceProps): ReactNode {
  return (
    <>
      {nextPiece?.map((block: Block, blockIndex: number) => (
        <div
          key={blockIndex}
          className={clsx(
            "w-grid-cell h-grid-cell box-border text-center",
            getClassNameForBlock(block),
            getClassNameForBlockPowerType(block),
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
