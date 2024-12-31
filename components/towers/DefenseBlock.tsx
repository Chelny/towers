import { ReactNode } from "react"
import { TowersLetter } from "@/interfaces/game"

type DefenseBlockProps = {
  letter?: TowersLetter
}

export default function DefenseBlock({ letter }: DefenseBlockProps): ReactNode {
  return (
    <>
      <div className="block-cube--face block-cube--front">{letter}</div>
      <div className="block-cube--face block-cube--right">{letter}</div>
      <div className="block-cube--face block-cube--back">{letter}</div>
      <div className="block-cube--face block-cube--left">{letter}</div>
      <div className="block-cube--face block-cube--top"></div>
      <div className="block-cube--face block-cube--bottom"></div>
    </>
  )
}
