import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/game/DefenseBlock"
import RegularBlock from "@/components/game/RegularBlock"
import SpecialDiamondBlock from "@/components/game/SpecialDiamondBlock"
import { PowerBarBlock } from "@/interfaces"
import { getClassNameForBlock, getClassNameForBlockPowerType, isPowerBarBlock, isSpecialDiamond } from "@/utils"
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
