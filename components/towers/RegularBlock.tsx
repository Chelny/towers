import { ReactNode } from "react"
import { PieceBlockLetter } from "@/server/towers/classes/PieceBlock"

type RegularBlockProps = {
  letter?: PieceBlockLetter
}

export default function RegularBlock({ letter }: RegularBlockProps): ReactNode {
  return <>{letter}</>
}
