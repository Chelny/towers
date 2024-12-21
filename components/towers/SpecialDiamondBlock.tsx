import { ReactNode } from "react"
import { SpecialDiamond } from "@/interfaces/game"

type SpecialDiamondBlockProps = {
  block: SpecialDiamond
}

export default function SpecialDiamondBlock(props: SpecialDiamondBlockProps): ReactNode {
  return (
    <>
      {props.block.specialDiamondType === "speed drop" && (
        <div className="special-diamond special-diamond1" data-testid="special-diamond-speed-drop"></div>
      )}

      {props.block.specialDiamondType === "remove powers" && (
        <div className="special-diamond special-diamond2" data-testid="special-diamond-remove-powers"></div>
      )}

      {props.block.specialDiamondType === "remove stones" && (
        <div className="special-diamond" data-testid="special-diamond-remove-stones"></div>
      )}
    </>
  )
}
