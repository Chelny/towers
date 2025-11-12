/**
 * Pads a board with empty string cells (`""`) until it reaches the required total cell count.
 *
 * @param board - The initial board array of strings (block types or empty strings).
 * @param maxCells - The maximum number of cells a board can have (default is 78).
 * @returns A new board array with the remaining cells filled with empty strings at the start.
 */
export const padBoardToMaxCells = (board: string[], maxCells: number = 78): string[] => {
  const paddingCount: number = maxCells - board.length;

  if (paddingCount <= 0) return board;

  return [...Array(paddingCount).fill(""), ...board];
};

/**
 * Splits an array of items into a 2D array based on a specified number of columns or rows,
 * and fills them either by row-first or column-first order.
 *
 * @template T The item type.
 * @param items - The flat array of items to be split into a 2D array.
 * @param count - Number of columns (if fill === 'cols') or rows (if fill === 'rows').
 * @param fill - Determines whether to fill the grid row-first ('rows') or column-first ('cols').
 * @returns A 2D array of items distributed evenly based on the fill direction.
 *
 * Example:
 * splitIntoColumns(['A','B','C','D','E','F'], 2, 'rows')
 * // => [ ['A','B','C'], ['D','E','F'] ]
 *
 * splitIntoColumns(['A','B','C','D','E','F'], 2, 'cols')
 * // => [ ['A','C','E'], ['B','D','F'] ]
 */
export const splitIntoColumns = <T>(items: T[], count: number, fill: "rows" | "cols" = "rows"): T[][] => {
  if (count <= 0) return [];

  const total: number = items.length;

  if (fill === "cols") {
    // Fill top to bottom in `count` columns
    const columns: T[][] = Array.from({ length: count }, () => []);
    items.forEach((item: T, i: number) => columns[i % count].push(item));
    return columns;
  } else {
    // Fill left to right in `count` rows
    const rowLength: number = Math.ceil(total / count);
    const columns: T[][] = Array.from({ length: rowLength }, () => []);

    for (let i = 0; i < total; i++) {
      const colIndex = Math.floor(i / count);
      columns[colIndex].push(items[i]);
    }

    return columns;
  }
};
