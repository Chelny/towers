import { PieceBlock, PieceBlockPosition, PowerPieceBlockPlainObject } from "@/server/towers/game/PieceBlock";

export class MedusaPieceBlock extends PieceBlock {
  constructor(position: PieceBlockPosition = { row: 0, col: 0 }) {
    super("ME", position);
  }

  public toPlainObject(): PowerPieceBlockPlainObject {
    return {
      letter: this.letter,
      position: this.position,
    };
  }
}
