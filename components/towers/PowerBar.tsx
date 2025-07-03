import { ReactNode } from "react"
import clsx from "clsx/lite"
import DefenseBlock from "@/components/towers/DefenseBlock"
import RegularBlock from "@/components/towers/RegularBlock"
import SpecialDiamondBlock from "@/components/towers/SpecialDiamondBlock"
import { PowerBarItemPlainObject, PowerBarPlainObject } from "@/server/towers/classes/PowerBar"
import { getClassNameForBlock, getClassNameForBlockPowerType } from "@/utils/block-class-names-utils"
import { isSpecialDiamond } from "@/utils/block-guards-utils"

type PowerBarProps = {
  powerBar?: PowerBarPlainObject
}

export default function PowerBar({ powerBar }: PowerBarProps): ReactNode {
  return (
    <>
      {powerBar?.queue?.map((block: PowerBarItemPlainObject, blockIndex: number) => (
        <div
          key={blockIndex}
          className={clsx(
            "w-grid-cell h-grid-cell box-border text-center",
            getClassNameForBlock(block),
            getClassNameForBlockPowerType(block),
          )}
        >
          {isSpecialDiamond(block) ? (
            <SpecialDiamondBlock block={block} />
          ) : block.powerType === "defense" ? (
            <DefenseBlock letter={block.letter} />
          ) : (
            <RegularBlock letter={block.letter} />
          )}
        </div>
      ))}
    </>
  )
}
