import {
  BOARD_COLS,
  BOARD_ROWS,
  DIRECTIONS,
  EMPTY_CELL,
  HIDDEN_ROWS_COUNT,
  HOO_SEQUENCE,
  MIN_MATCHING_BLOCKS,
} from "@/constants/game";
import { logger } from "@/lib/logger";
import { MedusaPieceBlock } from "@/server/towers/game/MedusaPieceBlock";
import { MidasPieceBlock } from "@/server/towers/game/MidasPieceBlock";
import { Piece } from "@/server/towers/game/Piece";
import {
  PieceBlock,
  PieceBlockLetter,
  PieceBlockPosition,
  PowerPieceBlockPlainObject,
  TowersBlockLetter,
} from "@/server/towers/game/PieceBlock";
import {
  isTowersPieceBlockLetter,
  TowersPieceBlock,
  TowersPieceBlockPlainObject,
} from "@/server/towers/game/TowersPieceBlock";
import { PowerBlock, TowersPieceBlockPowerManager } from "@/server/towers/game/TowersPieceBlockPowerManager";
import {
  Block,
  isEmptyCell,
  isMedusaPiece,
  isMidasPiece,
  isPowerBarItem,
  isTowersPieceBlock,
} from "@/server/towers/utils/piece-type-check";

export type BoardBlock = TowersPieceBlock | MedusaPieceBlock | MidasPieceBlock | typeof EMPTY_CELL;
export type BoardGridRow = BoardBlock[];
export type BoardGridCol = BoardBlock[];
export type BoardGridCell = BoardBlock;
export type BoardGrid = BoardBlock[][];

export type BoardBlockPlainObject = TowersPieceBlockPlainObject | PowerPieceBlockPlainObject | typeof EMPTY_CELL;
export type BoardGridRowPlainObject = BoardBlockPlainObject[];
export type BoardGridColPlainObject = BoardBlockPlainObject[];
export type BoardGridCellPlainObject = BoardBlockPlainObject;
export type BoardGridPlainObject = BoardBlockPlainObject[][];

interface Hoo {
  positions: PieceBlockPosition[]
  hoosFallsCount: number
}

export interface BlockToRemove {
  row: number
  col: number
  removedByOrigin?: PieceBlockPosition
}

export interface BoardPlainObject {
  grid: BoardGridPlainObject
  isHooDetected: boolean
  isGameOver: boolean
}

/**
 * Represents the game board for a single player.
 *
 * Handles block placement, power interactions, and game-over detection.
 * Each board is linked to a power manager  and a callback to forward
 * special blocks to the player's power bar.
 */
export class Board {
  public grid: BoardGrid;
  public towersPieceBlockPowerManager: TowersPieceBlockPowerManager;
  public isHooDetected: boolean = false;
  public hoos: Hoo[] = [];
  public hoosFallsCount: number = 0;
  public removedBlocksFromHoo: TowersPieceBlock[] = [];
  public matchingBlockColors: PieceBlockPosition[] = [];
  public removedBlocksCount: number = 0;
  public shouldApplyRemovedByOriginNextCycle: boolean = false;
  public isSpeedDropUnlocked: boolean = false;
  public isRemovePowersUnlocked: boolean = false;
  public isRemoveStonesUnlocked: boolean = false;
  public isGameOver: boolean = false;
  public partnerBoard: Board | null = null;
  public partnerSide: "left" | "right" | null = null;
  private addBlockToPowerBar: (block: PieceBlock) => void;

  constructor(
    towersPieceBlockPowerManager: TowersPieceBlockPowerManager,
    onAddBlockToPowerBar: (block: PieceBlock) => void,
  ) {
    this.grid = Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLS }, () => EMPTY_CELL));
    this.towersPieceBlockPowerManager = towersPieceBlockPowerManager;
    this.addBlockToPowerBar = onAddBlockToPowerBar;
  }

  /**
   * Function to check if a position is within board bounds
   *
   * @param row - The row index to check.
   * @param col - The column index to check.
   * @returns A boolean indicating whether the specified row and column are within the visible board bounds.
   */
  private isWithinBoardBounds(row: number, col: number): boolean {
    return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
  }

  /**
   * Checks if moving the piece to the given offset causes a collision.
   *
   * @param piece - The piece to check.
   * @returns `true` if collision occurs, otherwise `false`.
   */
  public hasCollision(piece: Piece): boolean {
    return piece.blocks.some((block: PieceBlock) => {
      const { row, col }: PieceBlockPosition = block.position;
      return !this.isWithinBoardBounds(row, col) || !isEmptyCell(this.grid[row][col]);
    });
  }

  /**
   * Places a piece on the board.
   *
   * @param piece - The piece to place.
   */
  public placePiece(piece: Piece): void {
    for (const block of piece.blocks) {
      const { row, col }: PieceBlockPosition = block.position;

      if (this.isWithinBoardBounds(row, col)) {
        this.grid[row][col] = block;
      }
    }

    this.printGrid();
  }

  private printGrid(): void {
    logger.debug("Board:");

    for (let row = 0; row < BOARD_ROWS; row++) {
      const rowString: string = this.grid[row]
        .map((cell: BoardBlock) => (cell instanceof PieceBlock ? cell.letter : "▪"))
        .join(EMPTY_CELL);

      logger.debug(rowString);
    }
  }

  /**
   * Applies the effect of a special piece to the game board. Converts adjacent blocks based on Medusa and Midas effects
   * while ensuring the committed piece itself turns into an empty cell.
   *
   * @param powerPiece - The block type to convert surrounding blocks into.
   */
  public async convertSurroundingBlocksToPowerBlocks(powerPiece: Piece): Promise<void> {
    const blocksToRemove: PieceBlockPosition[] = [];

    for (const block of powerPiece.blocks) {
      const { row: pieceBlockRow, col: pieceBlockCol }: PieceBlockPosition = block.position;

      for (const dir of DIRECTIONS) {
        const adjRow: number = pieceBlockRow + dir.row;
        const adjCol: number = pieceBlockCol + dir.col;

        if (this.isWithinBoardBounds(adjRow, adjCol)) {
          const currentBlock: BoardBlock = this.grid[adjRow][adjCol];

          if (isTowersPieceBlock(currentBlock)) {
            if (isMedusaPiece(powerPiece)) {
              this.grid[adjRow][adjCol] = new MedusaPieceBlock({ row: adjRow, col: adjCol });
            } else if (isMidasPiece(powerPiece)) {
              this.grid[adjRow][adjCol] = new TowersPieceBlock("I", { row: adjRow, col: adjCol });
            }
          }
        }
      }

      blocksToRemove.push({ row: pieceBlockRow, col: pieceBlockCol });
    }

    this.breakBlocks(blocksToRemove, false);
  }

  /**
   * Processes a landed piece and recursively handles all removal logic
   * for hoos (special sequences) and standard color matches.
   *
   * This method loops until no more matches exist:
   *  - Detects hoos and handles them.
   *  - Detects standard color matches and handles them.
   *  - Sends blocks to client for fade animation.
   *  - Removes blocks and shifts remaining blocks down.
   *
   * Also processes partner board if linked.
   *
   * @param waitForClientToFade - A callback that waits for the client to finish fade animations.
   * @returns A promise that resolves when all removals and shifts are done.
   */
  public async processLandedPiece(
    waitForClientToFade: (board: Board, blocks: BlockToRemove[]) => Promise<void>,
  ): Promise<void> {
    if (this.hoosFallsCount > 0) {
      this.hoosFallsCount--;
    }

    if (this.hoosFallsCount === 0) {
      this.isHooDetected = false;
    }

    const shouldTagRemovedByOrigin: boolean = this.shouldApplyRemovedByOriginNextCycle;
    this.shouldApplyRemovedByOriginNextCycle = false;

    let isKeepLooping: boolean = true;

    while (isKeepLooping) {
      isKeepLooping = false;

      // Hoos detection
      this.checkForHoos();

      if (this.hoos.length > 0) {
        this.isHooDetected = true;
        this.shouldApplyRemovedByOriginNextCycle = true;

        const sumOfFalls: number = this.hoos.reduce((sum: number, hoo: Hoo) => sum + hoo.hoosFallsCount, 0);
        const totalFalls: number = sumOfFalls + (sumOfFalls - 1);

        this.hoosFallsCount += totalFalls;

        const hoosBlocksToRemove: BlockToRemove[] = this.getHoosBlocksToRemove(shouldTagRemovedByOrigin);

        if (hoosBlocksToRemove.length > 0) {
          await waitForClientToFade(this, hoosBlocksToRemove);
          this.breakBlocks(hoosBlocksToRemove);

          const newBlocks: TowersPieceBlock[] = this.setBlocksToBeSentToOpponents(
            hoosBlocksToRemove,
            shouldTagRemovedByOrigin,
          );
          this.removedBlocksFromHoo.push(...newBlocks);

          this.hoos = [];
          isKeepLooping = true;
        }
      }

      // Color matching detection
      this.checkForMatchingBlockColors();

      // Process THIS board's matches
      if (this.matchingBlockColors.length > 0) {
        const matchingBlocksToRemove: BlockToRemove[] = this.getMatchingBlocksToRemove(
          this.matchingBlockColors,
          shouldTagRemovedByOrigin,
        );

        if (matchingBlocksToRemove.length > 0) {
          await waitForClientToFade(this, matchingBlocksToRemove);
          this.breakBlocks(matchingBlocksToRemove);

          const newBlocks: TowersPieceBlock[] = this.setBlocksToBeSentToOpponents(
            matchingBlocksToRemove,
            shouldTagRemovedByOrigin,
          );
          this.removedBlocksFromHoo.push(...newBlocks);

          this.matchingBlockColors = [];
          isKeepLooping = true;
        }
      }

      // Also process PARTNER board's matches if they exist
      if (this.partnerBoard && this.partnerBoard.matchingBlockColors.length > 0) {
        const partnerMatchingBlocksToRemove: BlockToRemove[] = this.getMatchingBlocksToRemove(
          this.partnerBoard.matchingBlockColors,
          shouldTagRemovedByOrigin,
        );

        if (partnerMatchingBlocksToRemove.length > 0) {
          await waitForClientToFade(this.partnerBoard, partnerMatchingBlocksToRemove);
          this.partnerBoard.breakBlocks(partnerMatchingBlocksToRemove);

          const newBlocks: TowersPieceBlock[] = this.setBlocksToBeSentToOpponents(
            partnerMatchingBlocksToRemove,
            shouldTagRemovedByOrigin,
          );
          this.partnerBoard.removedBlocksFromHoo.push(...newBlocks);

          this.partnerBoard.matchingBlockColors = [];
          isKeepLooping = true;
        }
      }
    }
  }

  /**
   * Computes the list of blocks to remove for all detected hoos (special sequences).
   *
   * Each hoo contains a set of positions. If `shouldTagRemovedByOrigin` is true,
   * each block will carry its own position as `removedByOrigin` for directional animation.
   *
   * @param shouldTagRemovedByOrigin - Whether to tag each block with its origin position.
   * @returns An array of blocks with row/col and optional removedByOrigin.
   */
  private getHoosBlocksToRemove(shouldTagRemovedByOrigin: boolean): BlockToRemove[] {
    return this.hoos.flatMap((hoo: Hoo) =>
      hoo.positions
        .filter((position: PieceBlockPosition) => {
          const block: BoardBlock = this.grid[position.row][position.col];
          return isTowersPieceBlock(block) && !block.isToBeRemoved;
        })
        .map((position: PieceBlockPosition) => {
          const block: TowersPieceBlock = this.grid[position.row][position.col] as TowersPieceBlock;
          block.isToBeRemoved = true;

          return {
            ...position,
            ...(shouldTagRemovedByOrigin ? { removedByOrigin: position } : {}),
          };
        }),
    );
  }

  /**
   * Computes the list of blocks to remove for standard color matches.
   *
   * The first matching position is used as the `removedByOrigin` for all blocks
   * if `shouldTagRemovedByOrigin` is true. This supports directional animations.
   *
   * @param matchingBlockColors - Positions of matched blocks.
   * @param shouldTagRemovedByOrigin - Whether to tag blocks with a common origin.
   * @returns An array of blocks with row/col and optional removedByOrigin.
   */
  private getMatchingBlocksToRemove(
    matchingBlockColors: PieceBlockPosition[],
    shouldTagRemovedByOrigin: boolean,
  ): BlockToRemove[] {
    const origin: PieceBlockPosition = matchingBlockColors[0];
    return matchingBlockColors
      .map((position: PieceBlockPosition) => {
        const block: BoardBlock = this.grid[position.row][position.col];
        if (!isTowersPieceBlock(block) || block.isToBeRemoved) return null;
        block.isToBeRemoved = true;

        return {
          ...position,
          ...(shouldTagRemovedByOrigin ? { removedByOrigin: origin } : {}),
        };
      })
      .filter((b: BlockToRemove | null): b is BlockToRemove => b !== null);
  }

  /**
   * Converts a list of removed blocks into TowersPieceBlock instances
   * to be sent to the opponent. This is only done if `shouldTagRemovedByOrigin` is true,
   * which indicates that blocks are part of a special removal event (like hoos).
   *
   * @param blocksToRemove - The blocks that will be removed.
   * @param shouldTagRemovedByOrigin - Whether to send blocks to opponent.
   * @returns An array of TowersPieceBlock to send, or an empty array.
   */
  private setBlocksToBeSentToOpponents(
    blocksToRemove: BlockToRemove[],
    shouldTagRemovedByOrigin?: boolean,
  ): TowersPieceBlock[] {
    if (shouldTagRemovedByOrigin) {
      const newBlocks: TowersPieceBlock[] = blocksToRemove
        .map(({ row, col }: BlockToRemove) => {
          const block: BoardBlock = this.grid[row][col];
          if (!isTowersPieceBlock(block)) return null;
          return new TowersPieceBlock(block.letter as TowersBlockLetter, { row, col });
        })
        .filter((block: TowersPieceBlock | null): block is TowersPieceBlock => !!block);

      return newBlocks;
    }

    return [];
  }

  /**
   * Checks the board for the word "TOWERS" in all four possible directions (horizontal, vertical, and both diagonals).
   * When a hoo is detected, it sets `isHooDetected` to `true` and calculates the number of falls based on the hoo type.
   * Multiple hoos can be detected at the same time, and the number of falls is accumulated.
   */
  private checkForHoos(): void {
    const directions: PieceBlockPosition[] = [
      { row: 0, col: 1 }, // Horizontal
      { row: 1, col: 0 }, // Vertical
      { row: 1, col: 1 }, // Diagonal (top-left to bottom-right)
      { row: 1, col: -1 }, // Diagonal (bottom-left to top-right)
    ];

    // Iterate through the board to find "TOWERS" sequences
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const block: BoardBlock = this.grid[row][col];

        if (!isTowersPieceBlock(block)) continue;

        if (block.letter === HOO_SEQUENCE[0]) {
          for (const possibleHooDirection of directions) {
            const sequence: PieceBlockPosition[] = this.findHooSequenceInDirection(row, col, possibleHooDirection);

            if (sequence.length > 0) {
              const hoosFallsCount: number = this.getNumFallsForHooType(possibleHooDirection);
              this.hoos.push({ positions: sequence, hoosFallsCount });
            }
          }
        }
      }
    }
  }

  /**
   * Checks for the "TOWERS" sequence on the board.
   *
   * @param startRow - The starting row position.
   * @param startCol - The starting column position.
   * @param possibleHooDirection - Possible hoo direction.
   * @returns An array of positions of blocks forming the "TOWERS" sequence.
   */
  private findHooSequenceInDirection(
    startRow: number,
    startCol: number,
    possibleHooDirection: PieceBlockPosition,
  ): PieceBlockPosition[] {
    const matchedSequence: PieceBlockPosition[] = [];
    let row: number = startRow;
    let col: number = startCol;
    let matchedSequenceLetters: string = "";

    while (this.isWithinBoardBounds(row, col) && matchedSequenceLetters.length < HOO_SEQUENCE.length) {
      const block: BoardBlock = this.grid[row][col];

      if (!isTowersPieceBlock(block) || block.letter !== HOO_SEQUENCE.charAt(matchedSequenceLetters.length)) {
        break;
      }

      matchedSequence.push({ row, col });
      matchedSequenceLetters += block.letter;

      // Move to the next position
      row += possibleHooDirection.row;
      col += possibleHooDirection.col;
    }

    return matchedSequenceLetters === HOO_SEQUENCE ? matchedSequence : [];
  }

  /**
   * Calculates the number of falls based on the hoo type.
   *
   * @param possibleHooDirection - Possible hoo direction.
   * @returns The number of falls for the hoo type.
   */
  private getNumFallsForHooType(possibleHooDirection: PieceBlockPosition): number {
    if (possibleHooDirection.row === 0 && possibleHooDirection.col === 1) {
      return 1; // Horizontal hoo
    } else if (
      (possibleHooDirection.row === 1 && possibleHooDirection.col === 1) ||
      (possibleHooDirection.row === 1 && possibleHooDirection.col === -1)
    ) {
      return 2; // Diagonal hoo
    } else if (possibleHooDirection.row === 1 && possibleHooDirection.col === 0) {
      return 3; // Vertical hoo
    }

    return 0;
  }

  /**
   * Checks for any clusters of matching TowersBlocks on this board (and partner board, if present)
   * and marks them for removal if they meet the match condition.
   *
   * If a partner board is present, this method treats both boards as one merged grid.
   * This allows matches to span the center line and break blocks on both boards.
   *
   * The scan checks in 8 directions: horizontal, vertical, and diagonals.
   * Detected matching blocks are added to `matchingBlockColors` on the respective board.
   */
  private checkForMatchingBlockColors(): void {
    let mergedGrid: BoardBlock[][] = [];
    let totalCols: number;

    if (this.partnerBoard) {
      const leftBoard: Board = this.partnerSide === "right" ? this : this.partnerBoard;
      const rightBoard: Board = this.partnerSide === "right" ? this.partnerBoard : this;

      totalCols = BOARD_COLS * 2;

      for (let row = 0; row < BOARD_ROWS; row++) {
        mergedGrid[row] = [...leftBoard.grid[row], ...rightBoard.grid[row]];
      }
    } else {
      mergedGrid = this.grid;
      totalCols = BOARD_COLS;
    }

    const allChains: PieceBlockPosition[] = [];

    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < totalCols; col++) {
        const block: BoardBlock = mergedGrid[row][col];
        if (!isTowersPieceBlock(block)) continue;

        for (const dir of DIRECTIONS) {
          const chain: PieceBlockPosition[] = [];
          let r: number = row;
          let c: number = col;

          while (
            r >= 0 &&
            r < BOARD_ROWS &&
            c >= 0 &&
            c < totalCols &&
            isTowersPieceBlock(mergedGrid[r][c]) &&
            (mergedGrid[r][c] as TowersPieceBlock).letter === block.letter
          ) {
            chain.push({ row: r, col: c });
            r += dir.row;
            c += dir.col;
          }

          if (chain.length >= MIN_MATCHING_BLOCKS) {
            allChains.push(...chain);
          }
        }
      }
    }

    const unique: Map<string, PieceBlockPosition> = new Map<string, PieceBlockPosition>();

    for (const pos of allChains) {
      const key: string = `${pos.row},${pos.col}`;
      unique.set(key, pos);
    }

    for (const pos of unique.values()) {
      if (this.partnerBoard) {
        if (pos.col < BOARD_COLS) {
          const leftBoard: Board = this.partnerSide === "right" ? this : this.partnerBoard!;
          leftBoard.matchingBlockColors.push({ row: pos.row, col: pos.col });
        } else {
          const cc: number = pos.col - BOARD_COLS;
          const rightBoard: Board = this.partnerSide === "right" ? this.partnerBoard! : this;
          rightBoard.matchingBlockColors.push({ row: pos.row, col: cc });
        }
      } else {
        this.matchingBlockColors.push({ row: pos.row, col: pos.col });
      }
    }
  }

  /**
   * Removes specified blocks from the grid, and optionally shifts blocks downward.
   *
   * @param blocksToRemove - An array of blocks to be removed, each with row/col and optional origin metadata.
   * @param isShiftDownBlocks - Whether to shift blocks down after removal (default: true).
   */
  private breakBlocks(blocksToRemove: BlockToRemove[], isShiftDownBlocks: boolean = true): void {
    this.removeBlocks(blocksToRemove);

    if (isShiftDownBlocks) {
      this.shiftDownBlocks();
    }
  }

  /**
   * Removes blocks from the board and updates the score.
   *
   * @param blockPositions - List of block positions to remove
   */
  private removeBlocks(blockPositions: PieceBlockPosition[]): void {
    if (blockPositions.length === 0) return;

    for (const { row, col } of blockPositions) {
      if (this.isWithinBoardBounds(row, col)) {
        const block: Block = this.grid[row][col];

        // Add power block to power bar
        if (isPowerBarItem(block)) {
          this.addBlockToPowerBar(block);
        }

        // Update block's power type and power level
        if (isTowersPieceBlock(block)) {
          block.isToBeRemoved = false;

          const blockLetter: PieceBlockLetter = block.letter;

          if (isTowersPieceBlockLetter(blockLetter)) {
            const powerState: PowerBlock = this.towersPieceBlockPowerManager.getTowersBlockPower(blockLetter);
            this.towersPieceBlockPowerManager.updatePowerBlock(blockLetter, {
              brokenBlocksCount: powerState?.brokenBlocksCount + 1,
            });
          }

          this.towersPieceBlockPowerManager.updatePowerBlockPower();
          this.removedBlocksCount++;
        }

        this.grid[row][col] = EMPTY_CELL;
      }
    }
  }

  /**
   * Shifts down blocks in a board grid after removing certain elements.
   * Empty spaces (EMPTY_CELL) will be filled from above, maintaining column structure.
   */
  public shiftDownBlocks(): void {
    for (let col = 0; col < BOARD_COLS; col++) {
      const newColumn: BoardGridCol = [];

      // Collect non-empty blocks from bottom to top
      for (let row = BOARD_ROWS - 1; row >= 0; row--) {
        if (!isEmptyCell(this.grid[row][col])) {
          newColumn.push(this.grid[row][col]);
        }
      }

      // Fill the rest of the column with empty cells
      while (newColumn.length < BOARD_ROWS) {
        newColumn.push(EMPTY_CELL);
      }

      // Reverse to place non-empty blocks at the bottom
      newColumn.reverse();

      for (let row = 0; row < BOARD_ROWS; row++) {
        this.grid[row][col] = newColumn[row];
      }
    }
  }

  /**
   * Randomly distributes blocks onto the board by selecting random columns
   * and placing each block at the appropriate height in that column.
   * Blocks are only placed if a valid position is found (not off the board).
   *
   * @param blocksToRemove - Array of incoming blocks to place (e.g. hoos blocks).
   */
  public placeBlocksFromHoo(blocksToRemove: TowersPieceBlock[]): void {
    // Shuffle blocks to distribute more randomly
    const shuffledBlocks: TowersPieceBlock[] = [...blocksToRemove].sort(() => Math.random() - 0.5);

    for (const block of shuffledBlocks) {
      if (!isTowersPieceBlock(block)) continue;

      let attempts: number = 0;
      let isPlaced: boolean = false;

      while (attempts < 5 && !isPlaced) {
        const col: number = Math.floor(Math.random() * BOARD_COLS);
        const row: number | null = this.getPlacementRowInColumn(col);

        if (row !== null) {
          this.grid[row][col] = new TowersPieceBlock(block.letter as TowersBlockLetter, { row, col });
          isPlaced = true;
        }

        attempts++;
      }
    }
  }

  /**
   * Finds the row index where a block can be placed in a given column.
   * This ensures the block rests directly above the highest non-empty cell
   * or at the bottom if the column is empty.
   *
   * @param col - The column index (0-based).
   * @returns The row index where the block should be placed, or `null` if the block
   *          cannot be placed (e.g. if the column is full and there's no space above).
   */
  private getPlacementRowInColumn(col: number): number | null {
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (!isEmptyCell(this.grid[row][col])) {
        // Found a non-empty cell → place block just above it
        return row > 0 ? row - 1 : null; // can't place above top row
      }
    }

    // Entire column is empty → place block at the bottom
    return BOARD_ROWS - 1;
  }

  /**
   * Checks if the game is over based on the position of the current piece and the state of the board.
   * A player loses if:
   * - Any part of the placed piece reaches row 0 or 1.
   * - Any existing blocks are pushed into row 0 or 1.
   *
   * @param piece - The last committed piece.
   * @returns `true` if the player has lost, otherwise `false`.
   */
  public checkIfGameOver(piece: Piece): boolean {
    const isOverlappingHiddenRows: boolean = piece.blocks.some((block: PieceBlock) => {
      const blockRow: number = block.position.row;
      return blockRow >= 0 && blockRow < HIDDEN_ROWS_COUNT;
    });

    if (isOverlappingHiddenRows) {
      this.isGameOver = true;
      logger.debug("Game Over for user: Placed piece is overlapping board bounds.");
      return true;
    }

    // Check if any existing block has reached row 2, 1 or 0
    for (let col = 0; col < BOARD_COLS; col++) {
      if (!isEmptyCell(this.grid[0][col]) || !isEmptyCell(this.grid[1][col]) || !isEmptyCell(this.grid[2][col])) {
        this.isGameOver = true;
        logger.debug("Game Over for user: No more space to place pieces.");
        return true;
      }
    }

    return false;
  }

  public toPlainObject(): BoardPlainObject {
    return {
      grid: this.grid.map((row: BoardGridRow) =>
        row.map((block: BoardGridCell) => (isEmptyCell(block) ? EMPTY_CELL : block.toPlainObject())),
      ),
      isHooDetected: this.isHooDetected,
      isGameOver: this.isGameOver,
    };
  }
}
