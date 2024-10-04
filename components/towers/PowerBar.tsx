import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/towers/DefenseBlock"
import RegularBlock from "@/components/towers/RegularBlock"
import SpecialDiamondBlock from "@/components/towers/SpecialDiamondBlock"
import { PowerBarBlock } from "@/interfaces/game"
import { getClassNameForBlock, getClassNameForBlockPowerType } from "@/utils/block-class-names-utils"
import { isPowerBarBlock, isSpecialDiamond } from "@/utils/block-guards-utils"
import styles from "./Block.module.scss"

type PowerBarProps = {
  blocks: PowerBarBlock[]
}

export default function PowerBar(props: PowerBarProps): ReactNode {
  return (
    <>
      {props.blocks.map((block: PowerBarBlock, blockIndex: number) => (
        <div
          key={blockIndex}
          className={clsx(
            "w-grid-cell h-grid-cell box-border text-center",
            styles[getClassNameForBlock(block)],
            styles[getClassNameForBlockPowerType(block)]
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
