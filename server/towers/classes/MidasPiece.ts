import { PIECE_LENGTH, PIECE_STARTING_COL, PIECE_STARTING_ROW } from "@/constants/game"
import { MidasPieceBlock } from "@/server/towers/classes/MidasPieceBlock"
import { Piece } from "@/server/towers/classes/Piece"
import { PieceBlockPosition } from "@/server/towers/classes/PieceBlock"

export class MidasPiece extends Piece {
  constructor(
    blocks: MidasPieceBlock[] = Array.from({ length: PIECE_LENGTH }, () => new MidasPieceBlock()),
    position: PieceBlockPosition = { row: PIECE_STARTING_ROW, col: PIECE_STARTING_COL },
  ) {
    super(blocks, position)
  }
}
