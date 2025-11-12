import type { Table } from "@/server/towers/models/Table";
import { BOARD_COLS, BOARD_ROWS, EMPTY_CELL, HIDDEN_ROWS_COUNT } from "@/constants/game";
import { RedisEvents, SocketEvents } from "@/constants/socket-events";
import { logger } from "@/lib/logger";
import { publishRedisEvent } from "@/server/redis/publish";
import { Board, BoardBlock, BoardGrid, BoardGridRow } from "@/server/towers/game/Board";
import { MedusaPieceBlock } from "@/server/towers/game/MedusaPieceBlock";
import { PieceBlockPosition, TowersBlockLetter, TowersBlockPowerLevel } from "@/server/towers/game/PieceBlock";
import { PowerBar, PowerBarItem, PowerBarItemPlainObject } from "@/server/towers/game/PowerBar";
import { SpecialDiamond, SpecialDiamondPlainObject } from "@/server/towers/game/SpecialDiamond";
import { TowersPieceBlock, TowersPieceBlockPlainObject } from "@/server/towers/game/TowersPieceBlock";
import { Player } from "@/server/towers/models/Player";
import { TableSeat } from "@/server/towers/models/TableSeat";
import {
  isEmptyCell,
  isMedusaPieceBlock,
  isSpecialDiamond,
  isTowersPieceBlock,
} from "@/server/towers/utils/piece-type-check";

export class PowerManager {
  private player: Player;
  private table: Table;
  private tableSeat: TableSeat | undefined;
  private users: Player[];
  private targetUser?: Player;
  private onApplyPower: (data: {
    sourceUsername?: string
    targetUsername?: string
    powerItem: PowerBarItemPlainObject
  }) => void = this.handleApplyPower.bind(this);

  constructor(player: Player, table: Table) {
    this.player = player;
    this.table = table;
    this.tableSeat = table.findSeatByPlayer(player);
    this.users = table.seatedPlayers;
    this.registerSocketListeners();
  }

  private get board(): Board | null | undefined {
    return this.tableSeat?.board;
  }

  private get grid(): BoardGrid | undefined {
    return this.tableSeat?.board?.grid;
  }

  private set grid(grid: BoardGrid) {
    if (!this.board) return;
    this.board.grid = grid;
  }

  private get powerBar(): PowerBar | null | undefined {
    return this.tableSeat?.powerBar;
  }

  private registerSocketListeners(): void {
    this.player.subscribe(SocketEvents.GAME_POWER_APPLY, this.onApplyPower);
    this.player.subscribe("disconnect", () => {
      this.cleanupSocketListeners();
    });
  }

  private cleanupSocketListeners(): void {
    this.player.unsubscribe(SocketEvents.GAME_POWER_APPLY, this.onApplyPower);
  }

  /**
   * Applies the specified power item effect to the current board,
   * depending on the item's type and whether it's an attack or defense.
   *
   * @param powerItem - The power item to apply (either a TowersPieceBlock or SpecialDiamond).
   * @param username - The username of the target player for logging purposes.
   */
  private async handleApplyPower({
    sourceUsername,
    targetUsername,
    powerItem,
  }: {
    sourceUsername?: string
    targetUsername?: string
    powerItem: PowerBarItemPlainObject
  }): Promise<void> {
    if ("powerLevel" in powerItem) {
      powerItem = TowersPieceBlock.fromJSON(powerItem as TowersPieceBlockPlainObject);

      const isAttack: boolean = powerItem.powerType === "attack";

      switch (powerItem.letter) {
        case "T":
          isAttack ? this.addRow() : this.removeRow();
          logger.debug(`${sourceUsername} ${isAttack ? "added a row to" : "removed a row from"} ${targetUsername}`);
          break;
        case "O":
          isAttack ? this.dither(powerItem.powerLevel) : this.clump(powerItem.powerLevel);
          logger.debug(`${sourceUsername} ${isAttack ? "dithered" : "clumped"} ${targetUsername}`);
          break;
        case "W":
          isAttack ? this.addStones(powerItem.powerLevel) : this.dropStones(powerItem.powerLevel);
          logger.debug(`${sourceUsername} ${isAttack ? "stoned" : "dropped stones for"} ${targetUsername}`);
          break;
        case "E":
          isAttack ? this.defuse(powerItem.powerLevel) : this.colorBlast();
          logger.debug(`${sourceUsername} ${isAttack ? "defused" : "color blasted"} ${targetUsername}`);
          break;
        case "R":
          isAttack ? this.medusaPiece() : this.midasPiece();
          logger.debug(
            `${sourceUsername} ${isAttack ? "sent a Medusa piece to" : "sent a Midas piece to"} ${targetUsername}`,
          );
          break;
        case "S":
          isAttack ? this.removePowers(powerItem.powerLevel) : this.colorPlague();
          logger.debug(
            `${sourceUsername} ${isAttack ? "removed powers from" : "sent a color plague to"} ${targetUsername}`,
          );
          break;
        default:
          logger.warn(`Unknown TowersPieceBlock letter: ${powerItem.letter}.`);
      }
    } else if ("powerType" in powerItem && !("powerLevel" in powerItem)) {
      powerItem = SpecialDiamond.fromJSON(powerItem as SpecialDiamondPlainObject);

      switch (powerItem.powerType) {
        case "speed drop":
          await this.specialSpeedDrop();
          logger.debug(`${sourceUsername} used speed drop effect on ${targetUsername}`);
          break;
        case "remove powers":
          this.specialRemovePowers();
          logger.debug(`${sourceUsername} removed powers from ${targetUsername}`);
          break;
        case "remove stones":
          this.specialRemoveStones();
          logger.debug(`${sourceUsername} removed stones from ${targetUsername}`);
          break;
        default:
          logger.warn(`Unknown SpecialDiamond power type: ${powerItem["powerType"]}.`);
      }
    } else {
      logger.warn(`Unknown block type: ${powerItem}`);
    }
  }

  /**
   * Sends  attack or defense to a target user or a random opponent.
   *
   * @param targetSeatNumber - Optional. The seat number to target.
   */
  public usePower(targetSeatNumber?: number): void {
    this.targetUser = undefined; // Clear previous target

    const powerItem: PowerBarItem | null | undefined = this.tableSeat?.powerBar?.useItem();
    if (!powerItem) {
      logger.warn("No power item available");
      return;
    }

    const isAttackPower: boolean =
      (isTowersPieceBlock(powerItem) && powerItem.powerType === "attack") ||
      (powerItem instanceof SpecialDiamond && ["speed drop", "remove powers"].includes(powerItem.powerType));

    const isDefensePower: boolean =
      (isTowersPieceBlock(powerItem) && powerItem.powerType === "defense") ||
      (powerItem instanceof SpecialDiamond && ["remove stones"].includes(powerItem.powerType));

    const allActiveUsers: Player[] = this.users.filter((player: Player) => {
      const seat: TableSeat | undefined = this.table.findSeatByPlayer(player);
      return seat && this.table.isPlayerPlaying(player) && !seat.board?.isGameOver;
    });

    const partner: Player | undefined = this.users.find((player: Player) => this.isPartner(player));
    const isOpponent = (player: Player): boolean => player.id !== this.player.id && !this.isPartner(player);
    const opponents: Player[] = allActiveUsers.filter((player: Player) => isOpponent(player));

    const sendPowerToTarget = async (target: Player): Promise<void> => {
      if (!this.tableSeat) return;

      if (isAttackPower && this.isPartner(target) && typeof targetSeatNumber === "undefined") {
        logger.warn(`Blocked spacebar attack to partner: ${target.username}`);
        return;
      }

      this.targetUser = target;

      await publishRedisEvent(RedisEvents.GAME_POWER_FIRE, {
        tableId: this.table.id,
        sourceUsername: this.player.username,
        targetUsername: target.username,
        targetSeatNumber: this.table.findSeatByPlayer(target)?.seatNumber,
        powerItem: powerItem.toPlainObject(),
      });
    };

    // Handle number key press (explicit target)
    if (typeof targetSeatNumber !== "undefined") {
      const targetUser: Player | undefined = allActiveUsers.find((player: Player) => {
        const seat: TableSeat | undefined = this.table.findSeatByPlayer(player);
        return seat?.seatNumber === targetSeatNumber;
      });

      if (typeof targetUser !== "undefined") {
        if ((isAttackPower && isOpponent(targetUser)) || isDefensePower) {
          sendPowerToTarget(targetUser);
        } else {
          logger.warn(`Invalid target at seat #${targetSeatNumber} for power: ${powerItem.powerType}`);
        }
      } else {
        logger.warn(`Target not found at seat #${targetSeatNumber}`);
      }
    }

    // Handle spacebar press (no target specified)
    else {
      if (isAttackPower && opponents.length > 0) {
        const targetUser: Player = opponents[Math.floor(Math.random() * opponents.length)];
        sendPowerToTarget(targetUser);
      } else if (isDefensePower) {
        // Defense to self
        this.handleApplyPower({
          sourceUsername: this.player.username,
          targetUsername: this.player.username,
          powerItem,
        });

        // Also send to partner, if they exist and playing
        if (typeof partner !== "undefined") {
          const partnerSeat: TableSeat | undefined = this.table.findSeatByPlayer(partner);

          if (partnerSeat != null && !partnerSeat?.board?.isGameOver) {
            sendPowerToTarget(partner);
          }
        }
      }
    }
  }

  /**
   * Determines if the given user is on the same team (but not the same user).
   *
   * @param player - The user to check.
   * @returns True if the user is a partner; otherwise, false.
   */
  private isPartner(player: Player): boolean {
    const seat: TableSeat | undefined = this.table.findSeatByPlayer(player);
    return !!this.tableSeat && !!seat && seat.teamNumber === this.tableSeat.teamNumber && player.id !== this.player.id;
  }

  /**
   * Adds an additional row to the bottom of an opponent’s screen.
   */
  private addRow(): void {
    if (!this.grid) return;

    this.grid.shift();
    this.grid.push(Array.from({ length: BOARD_COLS }, () => new TowersPieceBlock()));
  }

  /**
   * Removes the bottom row from the board.
   */
  private removeRow(): void {
    if (!this.grid) return;

    this.grid.pop();
    this.grid.unshift(new Array(BOARD_COLS).fill(EMPTY_CELL));
  }

  /**
   * Changes the position of a certain number of blocks so that there is never a break or setup of breaks after the
   * dither is used. Dither does not move stones. Minor, normal, and mega versions exist.
   *
   * @param powerLevel - The intensity of the effect ('minor', 'normal', 'mega').
   */
  private dither(powerLevel: TowersBlockPowerLevel): void {
    if (typeof powerLevel === "undefined" || !this.grid) return;

    const swapCount: number = this.getNumBlocksToRearrange(powerLevel);

    for (let i = 0; i < swapCount; i++) {
      let randomRow1: number, randomCol1: number, randomRow2: number, randomCol2: number;

      do {
        randomRow1 = Math.floor(Math.random() * BOARD_ROWS);
        randomCol1 = Math.floor(Math.random() * BOARD_COLS);
        randomRow2 = Math.floor(Math.random() * BOARD_ROWS);
        randomCol2 = Math.floor(Math.random() * BOARD_COLS);
      } while (
        // Ensure positions are different and valid
        (randomRow1 === randomRow2 && randomCol1 === randomCol2) ||
        isEmptyCell(this.grid[randomRow1][randomCol1]) ||
        isEmptyCell(this.grid[randomRow2][randomCol2]) ||
        isMedusaPieceBlock(this.grid[randomRow1][randomCol1]) ||
        isMedusaPieceBlock(this.grid[randomRow2][randomCol2]) ||
        // Ensure dithering does not set up three in a row
        this.isSettingUpThreeInRow(randomRow1, randomCol1, randomRow2, randomCol2) ||
        // Check if the swap would result in adjacent blocks of the same color and letter
        this.areAdjacentBlocksSame(randomRow1, randomCol1, randomRow2, randomCol2)
      );

      // Swap the blocks
      const temp: BoardBlock = this.grid[randomRow1][randomCol1];
      this.grid[randomRow1][randomCol1] = this.grid[randomRow2][randomCol2];
      this.grid[randomRow2][randomCol2] = temp;
    }
  }

  /**
   * Opposite of dither. Clump rearranges a certain number of blocks on the board to setup breaks. It will not however set
   * up a break directly (in other words, it never sets up three in a row). Clump comes in three flavours - minor, normal,
   * and mega and does not move stones.
   *
   * @param powerLevel - The intensity of the effect ('minor', 'normal', 'mega').
   */
  private clump(powerLevel: TowersBlockPowerLevel): void {
    if (!this.grid || typeof powerLevel === "undefined") return;

    const clumpCount: number = this.getNumBlocksToRearrange(powerLevel);

    for (let i = 0; i < clumpCount; i++) {
      let randomRow1: number, randomCol1: number, randomRow2: number, randomCol2: number;

      // Find two different random positions on the board
      do {
        randomRow1 = Math.floor(Math.random() * BOARD_ROWS);
        randomCol1 = Math.floor(Math.random() * BOARD_COLS);
        randomRow2 = Math.floor(Math.random() * BOARD_ROWS);
        randomCol2 = Math.floor(Math.random() * BOARD_COLS);
      } while (
        // Ensure positions are different and valid
        (randomRow1 === randomRow2 && randomCol1 === randomCol2) ||
        !isEmptyCell(this.grid[randomRow1][randomCol1]) ||
        !isEmptyCell(this.grid[randomRow2][randomCol2]) ||
        isMedusaPieceBlock(this.grid[randomRow1][randomCol1]) ||
        isMedusaPieceBlock(this.grid[randomRow2][randomCol2]) ||
        // Ensure clumping does not set up three in a row
        this.isSettingUpThreeInRow(randomRow1, randomCol1, randomRow2, randomCol2)
      );

      // Swap or rearrange blocks
      const temp: BoardBlock = this.grid[randomRow1][randomCol1];
      this.grid[randomRow1][randomCol1] = this.grid[randomRow2][randomCol2];
      this.grid[randomRow2][randomCol2] = temp;

      // After swapping, ensure no three in a row are set up
      if (this.isSettingUpThreeInRow(randomRow1, randomCol1, randomRow2, randomCol2)) {
        // Swap back if it sets up three in a row
        this.grid[randomRow2][randomCol2] = this.grid[randomRow1][randomCol1];
        this.grid[randomRow1][randomCol1] = temp;
      }
    }
  }

  /**
   * Minor adds one stone, normal adds two stones, and mega adds three to an opponent to the top of the board of one
   * opponent.
   *
   * @param powerLevel - The intensity of the effect ('minor', 'normal', 'mega').
   */
  private addStones(powerLevel: TowersBlockPowerLevel): void {
    if (!this.grid || typeof powerLevel === "undefined") return;

    const numStones: number = this.getPowerMagnitude(powerLevel);
    let stonesAddedCount: number = 0;

    while (stonesAddedCount <= numStones) {
      const col: number = Math.floor(Math.random() * BOARD_COLS);
      let isStonePlaced: boolean = false;

      for (let row = HIDDEN_ROWS_COUNT; row < BOARD_ROWS; row++) {
        if (!isEmptyCell(this.grid[row][col])) {
          this.grid[row][col] = new MedusaPieceBlock({ row, col });
          isStonePlaced = true;
          break;
        }
      }

      if (isStonePlaced) stonesAddedCount++;
    }
  }

  /**
   * Takes one to three stones depending on minor, normal or mega and places them on the bottom row of the same column;
   * the rest of the blocks are moved up. If a stone already exists on the bottom row, the stone is dropped to the next
   * highest row without a stone.
   *
   * @param powerLevel - The intensity of the effect ('minor', 'normal', 'mega').
   */
  private dropStones(powerLevel: TowersBlockPowerLevel): void {
    if (!this.grid || typeof powerLevel === "undefined") return;

    const numStones: number = this.getPowerMagnitude(powerLevel);
    const stonesToDrop: PieceBlockPosition[] = [];

    // Identify stones in each column
    for (let col = 0; col < BOARD_COLS; col++) {
      let dropRow: number = BOARD_ROWS - 1;

      // Find all stones from bottom up in the column
      while (dropRow >= HIDDEN_ROWS_COUNT) {
        if (isEmptyCell(this.grid[dropRow][col])) {
          break;
        } else if (isMedusaPieceBlock(this.grid[dropRow][col])) {
          // If stone is found, save its position
          stonesToDrop.push({ row: dropRow, col });
        }

        dropRow--;
      }
    }

    // Select random stones to drop based on numStones
    const selectedStones: PieceBlockPosition[] = stonesToDrop.sort(() => 0.5 - Math.random()).slice(0, numStones);

    // Process each stone to drop in its respective column
    for (const { row, col } of selectedStones) {
      const tempStone: MedusaPieceBlock = this.grid[row][col] as MedusaPieceBlock;

      // Shift up blocks below the stone
      for (let r = row; r < BOARD_ROWS - 1; r++) {
        this.grid[r][col] = this.grid[r + 1][col];
      }

      // Place the temp stone at the bottom row
      this.grid[BOARD_ROWS - 1][col] = tempStone;
    }
  }

  /**
   * A black stone replaces a purple power (E block) lodged in the board of an opponent. Minor, normal, and mega versions exist.
   *
   * @param powerLevel - The intensity of the effect ('minor', 'normal', 'mega').
   */
  private defuse(powerLevel: TowersBlockPowerLevel): void {
    if (!this.grid || typeof powerLevel === "undefined") return;

    const numPurpleBlocks: number = this.grid.reduce(
      (count: number, row: BoardGridRow) =>
        count + row.filter((block: BoardBlock) => isTowersPieceBlock(block) && block.letter === "E").length,
      0,
    );

    // Determine the number of purple powers to defuse based on the power level
    const numBlocksReplacement: number = this.getNumBlocksToRearrange(powerLevel, numPurpleBlocks);
    let powersDefusedCount: number = 0;

    // Traverse the board to find and replace purple powers with black stones
    outerLoop: for (let row = HIDDEN_ROWS_COUNT; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        if (powersDefusedCount >= numBlocksReplacement) break outerLoop;

        const pieceBlock: BoardBlock = this.grid[row][col];

        if (isTowersPieceBlock(pieceBlock) && pieceBlock.letter === "E") {
          this.grid[row][col] = new MedusaPieceBlock({ row, col });
          powersDefusedCount++;
        }
      }
    }
  }

  /**
   * Any purple power within the board suddenly becomes the center of a 3x3 purple square (E blocks). In other words, all
   * surrounding pieces of either a defuse or color blast already in the board become purple blocks. No different
   * versions.
   */
  private colorBlast(): void {
    if (!this.grid) return;

    // Collect positions of all purple powers (E blocks)
    const positions: PieceBlockPosition[] = [];

    for (let row = HIDDEN_ROWS_COUNT; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const pieceBlock: BoardBlock = this.grid[row][col];

        if (isTowersPieceBlock(pieceBlock) && pieceBlock.letter === "E") {
          positions.push({ row, col });
        }
      }
    }

    // Transform the collected positions into 3x3 purple squares (E blocks)
    for (const { row, col } of positions) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newRow: number = row + i;
          const newCol: number = col + j;

          if (
            newRow >= 0 &&
            newRow < BOARD_ROWS &&
            newCol >= 0 &&
            newCol < BOARD_COLS &&
            !isEmptyCell(this.grid[newRow][newCol]) &&
            !isMedusaPieceBlock(this.grid[newRow][newCol])
          ) {
            this.grid[newRow][newCol] = new TowersPieceBlock("E", { row: newRow, col: newCol });
          }
        }
      }
    }
  }

  /**
   * Adds a Medusa piece to the front of the current user's next pieces queue.
   * This replaces the oldest piece while maintaining the queue size.
   */
  private medusaPiece(): void {
    if (!this.tableSeat) return;
    this.tableSeat.nextPieces?.addMedusaPiece();
  }

  /**
   * Adds a Midas piece to the front of the current user's next pieces queue.
   * This replaces the oldest piece while maintaining the queue size.
   */
  private midasPiece(): void {
    if (!this.tableSeat) return;
    this.tableSeat.nextPieces?.addMidasPiece();
  }

  /**
   * Takes either one, two or three powers depending on minor/normal/mega from opponent’s power bar and
   * places them on the bottom row of their board.
   * @param powerLevel - The intensity of the effect ('minor', 'normal', 'mega').
   */
  private removePowers(powerLevel: TowersBlockPowerLevel): void {
    if (!this.grid || !this.powerBar || typeof powerLevel === "undefined") return;

    if (!this.powerBar.queue || this.powerBar.queue.length === 0) {
      logger.warn("Couldn’t remove items from power bar because power bar is empty.");
      return;
    }

    const numPowersToRemove: number = this.getPowerMagnitude(powerLevel);
    const removedPowers: PowerBarItem[] = [];

    // Remove power blocks from power bar
    for (let i = 0; i < numPowersToRemove && this.powerBar.queue.length > 0; i++) {
      const powerBarItem: PowerBarItem | null = this.powerBar.removePieceBlockItem();

      if (powerBarItem !== null && !isSpecialDiamond(powerBarItem)) {
        removedPowers.push(powerBarItem);
      }
    }

    // Place removed powers anywhere on the bottom row
    const bottomRow: BoardGridRow = this.grid[BOARD_ROWS - 1];

    removedPowers.forEach((powerBarItem: PowerBarItem) => {
      let colIndex: number;

      do {
        colIndex = Math.floor(Math.random() * bottomRow.length);
      } while (!isTowersPieceBlock(bottomRow[colIndex]));

      if (!isSpecialDiamond(powerBarItem) && this.grid) {
        this.grid[BOARD_ROWS - 1][colIndex] = powerBarItem;
      }
    });
  }

  /**
   * Removes the least abundant color on the board. No different versions. Does not affect stones (Medusa blocks).
   */
  private colorPlague(): void {
    if (!this.board || !this.grid) return;

    // Count the occurrences of each color
    const countColors = (): Record<string, number> => {
      const letterCount: Record<string, number> = {};

      this.grid?.forEach((row: BoardGridRow) => {
        row.forEach((block: BoardBlock) => {
          if (isTowersPieceBlock(block)) {
            letterCount[block.letter] = (letterCount[block.letter] || 0) + 1;
          }
        });
      });

      return letterCount;
    };

    // Count the occurrences of each color on the board
    const letterCount: Record<string, number> = countColors();

    // Find the least abundant color
    let leastAbundantColor: string | null = null;
    let leastCount: number = Infinity;

    Object.entries(letterCount).forEach(([color, count]) => {
      if (count < leastCount) {
        leastCount = count;
        leastAbundantColor = color;
      }
    });

    // Remove the least abundant color from the board
    if (leastAbundantColor) {
      for (let row = HIDDEN_ROWS_COUNT; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
          const block: BoardBlock = this.grid[row][col];
          if (isTowersPieceBlock(block) && block.letter === leastAbundantColor) {
            this.grid[row][col] = EMPTY_CELL; // Replace the color block with an empty cell
          }
        }
      }
    }

    // Shift down remaining blocks
    this.board.shiftDownBlocks();
  }

  /**
   * Calculates the number of blocks to rearrange on the board based on the given power level.
   * The function determines the total number of non-empty, non-Medusa blocks on the board,
   * and then applies a percentage based on the power level to calculate the number of blocks to rearrange.
   *
   * @param powerLevel - The power level indicating the intensity of the operation ("minor", "normal", or "mega").
   * @param totalBlocks - Optional. The total number of blocks on the board.
   * @returns The number of blocks to rearrange based on the power level.
   */
  private getNumBlocksToRearrange(powerLevel: TowersBlockPowerLevel, totalBlocks?: number): number {
    if (!this.grid) return 0;

    if (typeof totalBlocks === "undefined") {
      totalBlocks = this.grid.reduce(
        (count: number, row: BoardGridRow) =>
          count + row.filter((cell: BoardBlock) => !isEmptyCell(cell) && !isMedusaPieceBlock(cell)).length,
        0,
      );
    }

    const percentage: number = powerLevel === "minor" ? 0.15 : powerLevel === "normal" ? 0.3 : 0.5;

    return Math.ceil(totalBlocks * percentage);
  }

  /**
   * Checks if swapping two blocks on the board will create a setup of three blocks in a row either horizontally,
   * vertically, or diagonally. The function temporarily swaps the blocks, checks for the setup, and then swaps them back.
   *
   * @param row1 - The row index of the first block to swap.
   * @param col1 - The column index of the first block to swap.
   * @param row2 - The row index of the second block to swap.
   * @param col2 - The column index of the second block to swap.
   * @returns True if the swap sets up three blocks in a row; otherwise, false.
   */
  private isSettingUpThreeInRow(row1: number, col1: number, row2: number, col2: number): boolean {
    if (!this.grid) return false;

    const board: BoardGrid = this.grid;

    const checkHorizontal = (row: number, col: number): boolean => {
      const block: BoardBlock = board[row][col];
      if (!isTowersPieceBlock(block)) return false;

      let count: number = 1;

      // Check left
      for (let i = col - 1; i >= HIDDEN_ROWS_COUNT; i--) {
        const leftBlock: BoardBlock = board[row][i];
        if (!isTowersPieceBlock(leftBlock) || leftBlock.letter !== block.letter) break;
        count++;
      }

      // Check right
      for (let i = col + 1; i < BOARD_COLS; i++) {
        const rightBlock: BoardBlock = board[row][i];
        if (!isTowersPieceBlock(rightBlock) || rightBlock.letter !== block.letter) break;
        count++;
      }

      return count >= 3;
    };

    const checkVertical = (row: number, col: number): boolean => {
      const block: BoardBlock = board[row][col];
      if (!isTowersPieceBlock(block)) return false;

      let count: number = 1;

      // Check up
      for (let i = row - 1; i >= HIDDEN_ROWS_COUNT; i--) {
        const aboveBlock: BoardBlock = board[i][col];
        if (!isTowersPieceBlock(aboveBlock) || aboveBlock.letter !== block.letter) break;
        count++;
      }

      // Check down
      for (let i = row + 1; i < BOARD_ROWS; i++) {
        const belowBlock: BoardBlock = board[i][col];
        if (!isTowersPieceBlock(belowBlock) || belowBlock.letter !== block.letter) break;
        count++;
      }

      return count >= 3;
    };

    const checkDiagonal = (row: number, col: number): boolean => {
      const block: BoardBlock = board[row][col];
      if (!isTowersPieceBlock(block)) return false;

      let count1: number = 1;
      let count2: number = 1;

      // Top-left to bottom-right
      for (let i = 1; row - i >= HIDDEN_ROWS_COUNT && col - i >= HIDDEN_ROWS_COUNT; i++) {
        const checkBlock: BoardBlock = board[row - i][col - i];
        if (!isTowersPieceBlock(checkBlock) || checkBlock.letter !== block.letter) break;
        count1++;
      }

      for (let i = 1; row + i < BOARD_ROWS && col + i < BOARD_COLS; i++) {
        const checkBlock: BoardBlock = board[row + i][col + i];
        if (!isTowersPieceBlock(checkBlock) || checkBlock.letter !== block.letter) break;
        count1++;
      }

      // Bottom-left to top-right
      for (let i = 1; row - i >= HIDDEN_ROWS_COUNT && col + i < BOARD_COLS; i++) {
        const checkBlock: BoardBlock = board[row - i][col + i];
        if (!isTowersPieceBlock(checkBlock) || checkBlock.letter !== block.letter) break;
        count2++;
      }

      for (let i = 1; row + i < BOARD_ROWS && col - i >= HIDDEN_ROWS_COUNT; i++) {
        const checkBlock: BoardBlock = board[row + i][col - i];
        if (!isTowersPieceBlock(checkBlock) || checkBlock.letter !== block.letter) break;
        count2++;
      }

      return count1 >= 3 || count2 >= 3;
    };

    // Ensure indices are within bounds before swapping
    if (
      row1 < HIDDEN_ROWS_COUNT ||
      row1 >= BOARD_ROWS ||
      col1 < HIDDEN_ROWS_COUNT ||
      col1 >= BOARD_COLS ||
      row2 < HIDDEN_ROWS_COUNT ||
      row2 >= BOARD_ROWS ||
      col2 < HIDDEN_ROWS_COUNT ||
      col2 >= BOARD_COLS
    ) {
      return false;
    }

    // Temporarily swap the blocks to test if it sets up three in a row
    const temp: BoardBlock = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;

    // Check if the swap creates three in a row
    const isCreatesThreeInRow: boolean =
      checkHorizontal(row1, col1) ||
      checkHorizontal(row2, col2) ||
      checkVertical(row1, col1) ||
      checkVertical(row2, col2) ||
      checkDiagonal(row1, col1) ||
      checkDiagonal(row2, col2);

    // Swap the blocks back to their original positions
    board[row2][col2] = board[row1][col1];
    board[row1][col1] = temp;

    return isCreatesThreeInRow;
  }

  /**
   * Checks if swapping two blocks on the board will create adjacent blocks of the same color and letter.
   * Adjacency includes horizontal and vertical directions.
   *
   * @param row1 - The row index of the first block to swap.
   * @param col1 - The column index of the first block to swap.
   * @param row2 - The row index of the second block to swap.
   * @param col2 - The column index of the second block to swap.
   * @returns True if the swap would result in adjacent blocks of the same color and letter; otherwise, false.
   */
  private areAdjacentBlocksSame(row1: number, col1: number, row2: number, col2: number): boolean {
    if (!this.grid) return false;

    const board: BoardGrid = this.grid;

    // Temporarily swap the blocks
    const temp: BoardBlock = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;

    // Function to check if two blocks are the same type
    const blocksAreSame = (r1: number, c1: number, r2: number, c2: number): boolean => {
      const block1: BoardBlock = board[r1][c1];
      const block2: BoardBlock = board[r2][c2];

      if (!isTowersPieceBlock(block1) || !isTowersPieceBlock(block2)) return false;

      if (
        r1 >= 0 &&
        r1 < BOARD_ROWS &&
        c1 >= 0 &&
        c1 < BOARD_COLS &&
        r2 >= 0 &&
        r2 < BOARD_ROWS &&
        c2 >= 0 &&
        c2 < BOARD_COLS
      ) {
        return block1.letter === block2.letter;
      }

      return false; // Return false if any block is out of bounds
    };

    // Function to check horizontal adjacency for a block
    const checkHorizontal = (r: number, c: number): boolean => {
      // Check left and right blocks horizontally
      return (
        (c > 0 && blocksAreSame(r, c, r, c - 1)) || // Left of (r, c)
        (c < BOARD_COLS - 1 && blocksAreSame(r, c, r, c + 1)) // Right of (r, c)
      );
    };

    // Function to check vertical adjacency for a block
    const checkVertical = (r: number, c: number): boolean => {
      // Check directly below and above the current block (r, c)
      const below: boolean = r < BOARD_ROWS - 1 && blocksAreSame(r, c, r + 1, c);
      const above: boolean = r > 0 && blocksAreSame(r, c, r - 1, c);

      return below || above;
    };

    // Function to check all relevant adjacencies for a block
    const checkAllAdjacent = (r: number, c: number): boolean => {
      return checkHorizontal(r, c) || checkVertical(r, c);
    };

    // Check if either of the swapped blocks create adjacent blocks with the same letter
    const result: boolean = checkAllAdjacent(row1, col1) || checkAllAdjacent(row2, col2);

    // Swap the blocks back to their original positions
    board[row2][col2] = board[row1][col1];
    board[row1][col1] = temp;

    return result;
  }

  /**
   * Returns the numeric strength based on power level.
   * Used to scale intensity of effects (stone drops, power bar removal, etc.).
   *
   * @param powerLevel - The effect's strength ('minor', 'normal', 'mega', 'berserk').
   * @returns A number representing how strong the effect should be.
   */
  private getPowerMagnitude(powerLevel: TowersBlockPowerLevel): number {
    switch (powerLevel) {
      case "minor":
        return 1;
      case "normal":
        return 2;
      default:
        return 3;
    }
  }

  /**
   * Increases the speed of one opponent’s fall rate.
   */
  private async specialSpeedDrop(): Promise<void> {
    if (!this.targetUser) return;

    const seatNumber: number | undefined = this.table.findSeatByPlayer(this.targetUser)?.seatNumber;
    await publishRedisEvent(RedisEvents.PIECE_SPEED, { tableId: this.table.id, seatNumber });
  }

  /**
   * Removes all powers from an opponent’s board and power bar.
   */
  private specialRemovePowers(): void {
    if (!this.grid || !this.powerBar) return;

    this.grid = this.grid.map((row: BoardGridRow) =>
      row.map((block: BoardBlock) =>
        isTowersPieceBlock(block) ? new TowersPieceBlock(block.letter as TowersBlockLetter, block.position) : block,
      ),
    );

    this.powerBar.clear();
  }

  /**
   * Removes all stones from your board.
   */
  private specialRemoveStones(): void {
    if (!this.board || !this.grid) return;

    this.grid = this.grid.map((row: BoardGridRow) =>
      row.map((block: BoardBlock) => (isMedusaPieceBlock(block) ? EMPTY_CELL : block)),
    );

    // Shift down remaining blocks
    this.board.shiftDownBlocks();
  }
}
