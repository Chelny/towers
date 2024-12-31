import { ReactNode } from "react"
import { BlockLetter } from "@/interfaces/game"

type RegularBlockProps = {
  letter?: BlockLetter
}

export default function RegularBlock({ letter }: RegularBlockProps): ReactNode {
  return <>{letter}</>
}
