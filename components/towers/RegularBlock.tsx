import { ReactNode } from "react"
import { BlockLetter } from "@/interfaces/game"

type RegularBlockProps = {
  letter?: BlockLetter
}

export default function RegularBlock(props: RegularBlockProps): ReactNode {
  return <>{props.letter}</>
}
