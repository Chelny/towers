import React, { ReactNode } from "react"
import { SpecialDiamond } from "@/interfaces"
import styles from "./Block.module.scss"

type SpecialDiamondBlockProps = {
  block: SpecialDiamond
}

export default function SpecialDiamondBlock(props: SpecialDiamondBlockProps): ReactNode {
  return (
    <>
      {props.block.specialDiamondType === "speed drop" && (
        <div
          className={`${styles.SpecialDiamond} ${styles.SpecialDiamond1}`}
          data-testid="special-diamond-speed-drop"
        ></div>
      )}

      {props.block.specialDiamondType === "remove powers" && (
        <div
          className={`${styles.SpecialDiamond} ${styles.SpecialDiamond2}`}
          data-testid="special-diamond-remove-powers"
        ></div>
      )}

      {props.block.specialDiamondType === "remove stones" && (
        <div className={`${styles.SpecialDiamond}`} data-testid="special-diamond-remove-stones"></div>
      )}
    </>
  )
}
