import { ReactNode } from "react"
import { SpecialDiamond } from "@/interfaces/towers"

type SpecialDiamondBlockProps = {
  block: SpecialDiamond
}

export default function SpecialDiamondBlock({ block }: SpecialDiamondBlockProps): ReactNode {
  return (
    <>
      {block.powerType === "speed drop" && (
        <div className="special-diamond special-diamond1" data-testid="special-diamond_speed-drop"></div>
      )}

      {block.powerType === "remove powers" && (
        <div className="special-diamond special-diamond2" data-testid="special-diamond_remove-powers"></div>
      )}

      {block.powerType === "remove stones" && (
        <div className="special-diamond" data-testid="special-diamond_remove-stones"></div>
      )}
    </>
  )
}
