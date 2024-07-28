import React, { ReactNode } from "react"
import { BlockLetter } from "@/interfaces"

type RegularBlockProps = {
  letter?: BlockLetter
}

export default function RegularBlock(props: RegularBlockProps): ReactNode {
  return <>{props.letter}</>
}
