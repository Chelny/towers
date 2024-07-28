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
        <div className={`${styles.SpecialDiamond} ${styles.SpecialDiamond1}`}></div>
      )}

      {props.block.specialDiamondType === "remove powers" && (
        <div className={`${styles.SpecialDiamond} ${styles.SpecialDiamond2}`}></div>
      )}

      {props.block.specialDiamondType === "remove stones" && <div className={`${styles.SpecialDiamond}`}></div>}
    </>
  )
}
