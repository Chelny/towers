import { DisconnectReason, Socket } from "socket.io";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { ServerInternalEvents } from "@/constants/socket/server-internal";
import { logger } from "@/lib/logger";
import { publishRedisEvent } from "@/server/redis/publish";
import { SocketEventBinder } from "@/server/socket/SocketEventBinder";
import { TablePlayer } from "@/server/towers/classes/TablePlayer";
import { TableSeat } from "@/server/towers/classes/TableSeat";
import { Board, BoardGrid } from "@/server/towers/game/board/Board";
import { buildDefaultRegistry, PowerEffect, PowerEffectContext } from "@/server/towers/game/board/PowerEffectRegistry";
import { TowersBlockLetter, TowersBlockPowerType } from "@/server/towers/game/PieceBlock";
import { PowerBarItem, PowerBarItemPlainObject } from "@/server/towers/game/PowerBar";
import { SpecialDiamond, SpecialDiamondPlainObject } from "@/server/towers/game/SpecialDiamond";
import { TowersPieceBlock, TowersPieceBlockPlainObject } from "@/server/towers/game/TowersPieceBlock";
import { TableSeatManager } from "@/server/towers/managers/TableSeatManager";
import { isTowersPieceBlock } from "@/server/towers/utils/piece-type-check";

export class PowerManager {
  private tableId: string;
  private players: TablePlayer[];
  private tablePlayer: TablePlayer;
  private tableSeat?: TableSeat;
  private targetTablePlayer?: TablePlayer;
  private eventBinder: SocketEventBinder | null = null;
  private onApplyPower: (data: {
    sourceUsername?: string
    targetUsername?: string
    powerItem: PowerBarItemPlainObject
  }) => void = this.handleApplyPower.bind(this);
  private readonly registry = buildDefaultRegistry();

  constructor(tableId: string, players: TablePlayer[], tablePlayer: TablePlayer) {
    this.tableId = tableId;
    this.players = players;
    this.tablePlayer = tablePlayer;
    this.tableSeat = TableSeatManager.getSeatByPlayerId(tableId, tablePlayer.playerId);
    this.registerSocketListeners();
  }

  private registerSocketListeners(): void {
    const socket: Socket | null = this.tablePlayer.player.user.socket;
    if (!socket) return;

    this.eventBinder = new SocketEventBinder(socket);
    this.eventBinder.bind(ClientToServerEvents.GAME_POWER_APPLY, this.onApplyPower);

    socket.on("disconnect", (reason: DisconnectReason) => {
      const shouldCleanup: boolean =
        reason === "forced close" ||
        reason === "server shutting down" ||
        reason === "forced server close" ||
        reason === "client namespace disconnect" ||
        reason === "server namespace disconnect";

      if (shouldCleanup) {
        this.eventBinder?.unbindAll();
        this.eventBinder = null;
      }
    });
  }

  /**
   * Builds the execution context passed to all power effects.
   *
   * The context is a snapshot of the current player state and board references
   * at the moment a power is applied. It provides controlled access to:
   *
   * - The source player (who triggered the power)
   * - The optional target player (for attack / special powers)
   * - The source player's seat, board, and grid
   * - A safe `setGrid` helper used by effects to replace the board grid atomically
   * - The source player's power bar
   * - Optional debug metadata for logging and tracing (usernames)
   */
  private makeContext(debug?: { sourceUsername?: string; targetUsername?: string }): PowerEffectContext {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, this.tablePlayer.playerId);
    const board: Board | null = tableSeat?.board ?? null;
    const grid: BoardGrid | undefined = tableSeat?.board?.grid;

    return {
      tableId: this.tableId,
      seat: tableSeat,
      board,
      grid,
      setGrid: (grid: BoardGrid): void => {
        if (board) {
          board.grid = grid;
        }
      },
      powerBar: tableSeat?.powerBar ?? null,
      source: this.tablePlayer,
      target: this.targetTablePlayer,
      debug,
    };
  }

  /**
   * Applies the specified power item effect to the current board,
   * depending on the item's type and whether it's an attack or defense.
   *
   * @param sourceUsername - The username of the source player for logging purposes.
   * @param targetUsername - The username of the target player for logging purposes.
   * @param powerItem - The power item to apply (either a TowersPieceBlock or SpecialDiamond).
   */
  private handleApplyPower({
    sourceUsername,
    targetUsername,
    powerItem,
  }: {
    sourceUsername?: string
    targetUsername?: string
    powerItem: PowerBarItemPlainObject
  }): void {
    const ctx: PowerEffectContext = this.makeContext();

    ctx.debug = { sourceUsername, targetUsername };

    if ("powerLevel" in powerItem) {
      const item: TowersPieceBlock = TowersPieceBlock.fromPlainObject(powerItem as TowersPieceBlockPlainObject);
      const mode: TowersBlockPowerType = item.powerType;
      const effect: PowerEffect<TowersPieceBlock> | undefined = this.registry.getTowers(
        item.letter as TowersBlockLetter,
        mode,
      );

      if (!effect) {
        logger.warn(`[power] missing effect ${item.letter}:${mode}`);
        return;
      }

      logger.debug(
        `${sourceUsername ?? "?"} -> ${targetUsername ?? "?"} : ${item.letter}:${mode} (${item.powerLevel ?? "n/a"})`,
      );

      effect.apply(ctx, item);
      return;
    }

    if ("powerType" in powerItem) {
      const item: SpecialDiamond = SpecialDiamond.fromPlainObject(powerItem as SpecialDiamondPlainObject);
      const effect: PowerEffect<SpecialDiamond> | undefined = this.registry.getDiamond(item.powerType);

      if (!effect) {
        logger.warn(`[power] missing diamond effect ${item.powerType}`);
        return;
      }

      logger.debug(`${sourceUsername ?? "?"} -> ${targetUsername ?? "?"} : diamond:${item.powerType}`);

      effect.apply(ctx, item);
      return;
    }

    logger.warn("Unknown power item");
  }

  /**
   * Sends attack or defense to a target player or a random opponent.
   *
   * @param targetSeatNumber - Optional. The seat number to target.
   */
  public usePower(targetSeatNumber?: number): void {
    this.targetTablePlayer = undefined; // Clear previous target

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

    const allActiveUsers: TablePlayer[] = this.players.filter((tablePlayer: TablePlayer) => {
      const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, tablePlayer.playerId);
      return tableSeat && tablePlayer.isPlaying && !tableSeat.board?.isGameOver;
    });

    const partner: TablePlayer | undefined = this.players.find((tablePlayer: TablePlayer) =>
      this.isPartner(tablePlayer),
    );
    const isOpponent = (tablePlayer: TablePlayer): boolean =>
      tablePlayer.playerId !== this.tablePlayer.playerId && !this.isPartner(tablePlayer);
    const opponents: TablePlayer[] = allActiveUsers.filter((tablePlayer: TablePlayer) => isOpponent(tablePlayer));

    const sendPowerToTarget = async (targetTablePlayer: TablePlayer): Promise<void> => {
      if (!this.tableSeat) return;

      if (isAttackPower && this.isPartner(targetTablePlayer) && typeof targetSeatNumber === "undefined") {
        logger.warn(`Blocked spacebar attack to partner: ${targetTablePlayer.player.user.username}`);
        return;
      }

      this.targetTablePlayer = targetTablePlayer;

      await publishRedisEvent(ServerInternalEvents.GAME_POWER_FIRE, {
        sourceUsername: this.tablePlayer.player.user.username,
        targetUsername: targetTablePlayer.player.user.username,
        targetSeatNumber: targetTablePlayer.seatNumber,
        powerItem: powerItem.toPlainObject(),
      });
    };

    // Handle number key press (explicit target)
    if (typeof targetSeatNumber !== "undefined") {
      const targetTablePlayer: TablePlayer | undefined = allActiveUsers.find((tablePlayer: TablePlayer) => {
        const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, tablePlayer.playerId);
        return tableSeat?.seatNumber === targetSeatNumber;
      });

      if (typeof targetTablePlayer !== "undefined") {
        if ((isAttackPower && isOpponent(targetTablePlayer)) || isDefensePower) {
          sendPowerToTarget(targetTablePlayer);
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
        const targetTablePlayer: TablePlayer = opponents[Math.floor(Math.random() * opponents.length)];
        sendPowerToTarget(targetTablePlayer);
      } else if (isDefensePower) {
        // Defense to self
        this.handleApplyPower({
          sourceUsername: this.tablePlayer.player.user.username,
          targetUsername: this.tablePlayer.player.user.username,
          powerItem,
        });

        // Also send to partner, if they exist and playing
        if (typeof partner !== "undefined" && this.tableSeat?.tableId) {
          const partnerTableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(
            this.tableId,
            partner.playerId,
          );

          if (typeof partnerTableSeat !== "undefined" && !partnerTableSeat?.board?.isGameOver) {
            sendPowerToTarget(partner);
          }
        }
      }
    }
  }

  /**
   * Determines if the given player is on the same team.
   *
   * @param tablePlayer - The player to check.
   * @returns True if the player is a partner; otherwise, false.
   */
  private isPartner(tablePlayer: TablePlayer): boolean {
    const tableSeat: TableSeat | undefined = TableSeatManager.getSeatByPlayerId(this.tableId, tablePlayer.playerId);
    return (
      !!this.tableSeat &&
      !!tableSeat &&
      tableSeat.teamNumber === this.tableSeat.teamNumber &&
      tablePlayer.playerId !== this.tablePlayer.playerId
    );
  }
}
