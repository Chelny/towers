import { ReactNode } from "react"
import GridRow from "@/components/towers/GridRow"
import { BlockToRemove, BoardGridRowPlainObject, BoardPlainObject } from "@/server/towers/classes/Board"
import { PiecePlainObject } from "@/server/towers/classes/Piece"

type GridProps = {
  isOpponentBoard?: boolean
  board?: BoardPlainObject
  currentPiece?: PiecePlainObject
  blocksToRemove?: BlockToRemove[]
}

export default function Grid({ board, isOpponentBoard = false, currentPiece, blocksToRemove }: GridProps): ReactNode {
  return (
    <div className="static z-10" role="grid" tabIndex={0}>
      {board?.grid?.map((row: BoardGridRowPlainObject, rowIndex: number) => (
        <GridRow
          key={rowIndex}
          rowIndex={rowIndex}
          row={row}
          isOpponentBoard={isOpponentBoard}
          currentPiece={currentPiece}
          blocksToRemove={blocksToRemove}
        />
      ))}
    </div>
  )
}
