import { MutableRefObject, ReactNode, useEffect, useRef } from "react"
import GridRow from "@/components/game/GridRow"
import { Board, BoardRow } from "@/interfaces/game"

type GridProps = {
  board: Board
  isOpponentBoard?: boolean
}

export default function Grid(props: GridProps): ReactNode {
  const boardRef: MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    boardRef.current?.focus()
  }, [])

  return (
    <div ref={boardRef} className="static z-10" role="grid" tabIndex={0}>
      {props.board.map((row: BoardRow, rowIndex: number) => (
        <GridRow key={rowIndex} rowIndex={rowIndex} row={row} isOpponentBoard={props.isOpponentBoard} />
      ))}
    </div>
  )
}
