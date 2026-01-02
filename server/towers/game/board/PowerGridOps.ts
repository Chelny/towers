import type { PowerEffectContext } from "@/server/towers/game/board/PowerEffectRegistry";
import { BoardGrid, BoardGridRow } from "@/server/towers/game/board/Board";

export class PowerGridOps {
  public static cloneGrid(grid: BoardGrid): BoardGrid {
    return grid.map((row: BoardGridRow) => [...row]);
  }

  public static commit(ctx: PowerEffectContext, grid: BoardGrid): void {
    ctx.setGrid?.(grid);
  }
}
