import { ReactNode } from "react"
import clsx from "clsx/lite"
import GridCell from "@/components/towers/GridCell"
import { HIDDEN_ROWS_COUNT } from "@/constants/game"
import { BoardBlock, BoardRow } from "@/interfaces/game"

type GridRowProps = {
  rowIndex: number
  row: BoardRow
  isOpponentBoard?: boolean
}

export default function GridRow(props: GridRowProps): ReactNode {
  return (
    <div
      className={clsx(
        "grid",
        props.rowIndex < HIDDEN_ROWS_COUNT && "hidden",
        props.isOpponentBoard ? "grid-cols-grid-row-opponent" : "grid-cols-grid-row",
      )}
      role="row"
    >
      {props.row.map((block: BoardBlock, colIndex: number) => (
        <GridCell key={colIndex} block={block} isOpponentBoard={props.isOpponentBoard} />
      ))}
    </div>
  )
}
