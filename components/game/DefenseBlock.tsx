import React, { ReactNode } from "react"
import { TowersLetter } from "@/interfaces"
import styles from "./Block.module.scss"

type DefenseBlockProps = {
  letter?: TowersLetter
}

export default function DefenseBlock(props: DefenseBlockProps): ReactNode {
  return (
    <>
      <div className={`${styles.BlockCubeFace} ${styles.BlockCubeFront}`}>{props.letter}</div>
      <div className={`${styles.BlockCubeFace} ${styles.BlockCubeRight}`}>{props.letter}</div>
      <div className={`${styles.BlockCubeFace} ${styles.BlockCubeBack}`}>{props.letter}</div>
      <div className={`${styles.BlockCubeFace} ${styles.BlockCubeLeft}`}>{props.letter}</div>
      <div className={`${styles.BlockCubeFace} ${styles.BlockCubeTop}`}></div>
      <div className={`${styles.BlockCubeFace} ${styles.BlockCubeBottom}`}></div>
    </>
  )
}
