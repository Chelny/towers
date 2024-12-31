import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/towers/DefenseBlock"
import RegularBlock from "@/components/towers/RegularBlock"
import SpecialDiamondBlock from "@/components/towers/SpecialDiamondBlock"
import { PowerBarBlock } from "@/interfaces/game"
import { getClassNameForBlock, getClassNameForBlockPowerType } from "@/utils/block-class-names-utils"
import { isPowerBarBlock, isSpecialDiamond } from "@/utils/block-guards-utils"

type PowerBarProps = {
  blocks: PowerBarBlock[]
}

export default function PowerBar({ blocks }: PowerBarProps): ReactNode {
  return (
    <>
      {blocks.map((block: PowerBarBlock, blockIndex: number) => (
        <div
          key={blockIndex}
          className={clsx(
            "w-grid-cell h-grid-cell box-border text-center",
            getClassNameForBlock(block),
            getClassNameForBlockPowerType(block),
          )}
        >
          {isPowerBarBlock(block) &&
            (isSpecialDiamond(block) ? (
              <SpecialDiamondBlock block={block} />
            ) : block.powerType === "defense" ? (
              <DefenseBlock letter={block.letter} />
            ) : (
              <RegularBlock letter={block.letter} />
            ))}
        </div>
      ))}
    </>
  )
}
