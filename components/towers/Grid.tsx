import { ReactNode, RefObject, useEffect, useRef } from "react"
import GridRow from "@/components/towers/GridRow"
import { Board, BoardRow } from "@/interfaces/game"

type GridProps = {
  board: Board
  isOpponentBoard?: boolean
}

export default function Grid({ board, isOpponentBoard }: GridProps): ReactNode {
  const boardRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    boardRef.current?.focus()
  }, [])

  return (
    <div ref={boardRef} className="static z-10" role="grid" tabIndex={0}>
      {board.map((row: BoardRow, rowIndex: number) => (
        <GridRow key={rowIndex} rowIndex={rowIndex} row={row} isOpponentBoard={isOpponentBoard} />
      ))}
    </div>
  )
}
