import { ReactNode } from "react"
import { TowersLetter } from "@/interfaces/game"

type DefenseBlockProps = {
  letter?: TowersLetter
}

export default function DefenseBlock(props: DefenseBlockProps): ReactNode {
  return (
    <>
      <div className="block-cube--face block-cube--front">{props.letter}</div>
      <div className="block-cube--face block-cube--right">{props.letter}</div>
      <div className="block-cube--face block-cube--back">{props.letter}</div>
      <div className="block-cube--face block-cube--left">{props.letter}</div>
      <div className="block-cube--face block-cube--top"></div>
      <div className="block-cube--face block-cube--bottom"></div>
    </>
  )
}
