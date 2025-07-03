import { PIECE_LENGTH, PIECE_STARTING_COL, PIECE_STARTING_ROW } from "@/constants/game"
import { MedusaPieceBlock } from "@/server/towers/classes/MedusaPieceBlock"
import { Piece } from "@/server/towers/classes/Piece"
import { PieceBlockPosition } from "@/server/towers/classes/PieceBlock"

export class MedusaPiece extends Piece {
  constructor(
    blocks: MedusaPieceBlock[] = Array.from({ length: PIECE_LENGTH }, () => new MedusaPieceBlock()),
    position: PieceBlockPosition = { row: PIECE_STARTING_ROW, col: PIECE_STARTING_COL },
  ) {
    super(blocks, position)
  }
}
