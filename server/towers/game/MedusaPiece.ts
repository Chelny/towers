import { PIECE_LENGTH, PIECE_STARTING_COL, PIECE_STARTING_ROW } from "@/constants/game";
import { MedusaPieceBlock } from "@/server/towers/game/MedusaPieceBlock";
import { Piece } from "@/server/towers/game/Piece";
import { PieceBlockPosition } from "@/server/towers/game/PieceBlock";

export class MedusaPiece extends Piece {
  constructor(
    blocks: MedusaPieceBlock[] = Array.from({ length: PIECE_LENGTH }, () => new MedusaPieceBlock()),
    position: PieceBlockPosition = { row: PIECE_STARTING_ROW, col: PIECE_STARTING_COL },
  ) {
    super(blocks, position);
  }
}
