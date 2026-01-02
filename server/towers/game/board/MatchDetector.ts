import type { BoardBlock } from "@/server/towers/game/board/Board";
import { BOARD_ROWS, HIDDEN_ROWS_COUNT, MATCH_DIRECTIONS, MIN_MATCHING_BLOCKS } from "@/constants/game";
import { PieceBlockPosition } from "@/server/towers/game/PieceBlock";
import { isTowersPieceBlock } from "@/server/towers/utils/piece-type-check";

export class MatchDetector {
  /**
   * Checks the board for the word "YOUPI!" in all four possible directions (horizontal, vertical, and both diagonals).
   * When a hoo is detected, it sets `isHooDetected` to `true` and calculates the number of falls based on the hoo type.
   * Multiple hoos can be detected at the same time, and the number of falls is accumulated.
   */
  public detect(grid: BoardBlock[][], totalCols: number, startRow = HIDDEN_ROWS_COUNT): PieceBlockPosition[] {
    const matchedPositions: PieceBlockPosition[] = [];

    for (let row = startRow; row < BOARD_ROWS; row++) {
      for (let col = 0; col < totalCols; col++) {
        const startCell: BoardBlock = grid[row][col];
        if (!isTowersPieceBlock(startCell)) continue;

        for (const direction of MATCH_DIRECTIONS) {
          const chain: PieceBlockPosition[] = [];
          let r: number = row;
          let c: number = col;

          while (true) {
            if (r < startRow || r >= BOARD_ROWS || c < 0 || c >= totalCols) break;

            const cell: BoardBlock = grid[r][c];
            if (!isTowersPieceBlock(cell)) break;
            if (cell.letter !== startCell.letter) break;

            chain.push({ row: r, col: c });
            r += direction.row;
            c += direction.col;
          }

          if (chain.length >= MIN_MATCHING_BLOCKS) matchedPositions.push(...chain);
        }
      }
    }

    const unique: Map<string, PieceBlockPosition> = new Map<string, PieceBlockPosition>();

    for (const position of matchedPositions) {
      unique.set(`${position.row},${position.col}`, position);
    }

    return [...unique.values()];
  }
}
