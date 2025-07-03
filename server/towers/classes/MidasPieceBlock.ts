import { PieceBlock, PieceBlockPosition, PowerPieceBlockPlainObject } from "@/server/towers/classes/PieceBlock"

export class MidasPieceBlock extends PieceBlock {
  constructor(position: PieceBlockPosition = { row: 0, col: 0 }) {
    super("MI", position)
  }

  public toPlainObject(): PowerPieceBlockPlainObject {
    return {
      letter: this.letter,
      position: this.position,
    }
  }
}
