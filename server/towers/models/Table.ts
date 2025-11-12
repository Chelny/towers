import { GameState, TowersGameWithRelations } from "db";
import { MIN_READY_TEAMS_COUNT, NUM_TABLE_SEATS } from "@/constants/game";
import prisma from "@/lib/prisma";
import { getTowersGameIncludes } from "@/prisma/selects";
import { PlayerFactory } from "@/server/towers/factories/PlayerFactory";
import { Board } from "@/server/towers/game/Board";
import { Game, GameJSON } from "@/server/towers/models/Game";
import { Player, PlayerJSON } from "@/server/towers/models/Player";
import { TableSeat, TableSeatJSON } from "@/server/towers/models/TableSeat";
import { isTestMode } from "@/server/towers/utils/test";

export type PlayerState = {
  player: Player
  isReady: boolean
  isPlaying: boolean
}

export type PlayerStateJSON = {
  player: PlayerJSON
  isReady: boolean
  isPlaying: boolean
}

export interface TableJSON {
  readonly id: string
  readonly tableSeats: TableSeatJSON[]
  readonly playersState: PlayerStateJSON[]
  readonly game?: GameJSON
}

export class Table {
  public id: string;
  public isRated: boolean;
  public tableSeats: Map<number, TableSeat> = new Map<number, TableSeat>();
  public playersState: Map<string, PlayerState> = new Map<string, PlayerState>();
  public game?: Game;

  constructor(id: string, isRated: boolean = true) {
    this.id = id;
    this.isRated = isRated;

    for (let i = 1; i <= NUM_TABLE_SEATS; i++) {
      this.tableSeats.set(i, new TableSeat(this.id, i, Math.ceil(i / 2)));
    }
  }

  public get seats(): TableSeat[] {
    return [...this.tableSeats.values()];
  }

  public get occupiedSeats(): TableSeat[] {
    return this.seats.filter((tableSeat: TableSeat) => tableSeat.occupiedByPlayer);
  }

  public get seatedPlayers(): Player[] {
    return this.occupiedSeats.map((tableSeat: TableSeat) => tableSeat.occupiedByPlayer!);
  }

  // --------------------------------------------------
  // Seat State
  // --------------------------------------------------

  public getSeatByPlayerId(playerId: string): TableSeat | undefined {
    return [...this.tableSeats.values()].find((tableSeat: TableSeat) => tableSeat.occupiedByPlayerId === playerId);
  }

  public occupySeat(tableSeatNumber: number, player: Player): void {
    const tableSeat: TableSeat | undefined = this.tableSeats.get(tableSeatNumber);
    if (!tableSeat) return;

    tableSeat.occupy(player);
    this.playersState.set(player.id, { player, isReady: false, isPlaying: false });
  }

  public vacateSeat(tableSeatNumber: number): void {
    const tableSeat: TableSeat | undefined = this.tableSeats.get(tableSeatNumber);
    if (!tableSeat) return;

    if (tableSeat.occupiedByPlayerId) {
      this.playersState.delete(tableSeat.occupiedByPlayerId);
      tableSeat.vacate();
    }
  }

  public findSeatByPlayer(player: Player): TableSeat | undefined {
    return this.seats.find((tableSeat: TableSeat) => tableSeat.occupiedByPlayer?.id === player?.id);
  }

  public findSeatByBoard(board: Board): TableSeat | undefined {
    return this.seats.find((tableSeat: TableSeat) => tableSeat.board === board);
  }

  // --------------------------------------------------
  // Ready / Playing
  // --------------------------------------------------

  public setPlayerReady(playerId: string, isReady: boolean): void {
    const state: PlayerState | undefined = this.playersState.get(playerId);
    if (!state) throw new Error(`Player ${playerId} not seated`);
    state.isReady = isReady;

    if (this.canStartCountdown()) {
      this.prepareGameCountdown();
    }
  }

  public isPlayerReady(player: Player): boolean {
    if (!player || !player.id) return false;

    const seat: TableSeat | undefined = this.findSeatByPlayer(player);
    if (!seat) return false;

    const playerState: PlayerState | undefined = this.playersState.get(player.id);
    return playerState?.isReady ?? false;
  }

  public clearAllReady(): void {
    this.playersState.forEach((state: PlayerState) => (state.isReady = false));
  }

  public setPlayerPlaying(playerId: string, isPlaying: boolean): void {
    const state: PlayerState | undefined = this.playersState.get(playerId);
    if (!state) throw new Error(`Player ${playerId} not seated`);
    state.isPlaying = isPlaying;
  }

  public isPlayerPlaying(player: Player): boolean {
    if (!player || !player.id) return false;

    const seat: TableSeat | undefined = this.findSeatByPlayer(player);
    if (!seat) return false;

    const playerState: PlayerState | undefined = this.playersState.get(player.id);
    return playerState?.isPlaying ?? false;
  }

  public clearAllPlaying(): void {
    this.playersState.forEach((state: PlayerState) => (state.isPlaying = false));
  }

  // --------------------------------------------------
  // Game
  // --------------------------------------------------

  /**
   * Checks whether the game has the minimum required conditions to continue:
   * - At least 2 seated users
   * - All seated users are ready
   * - At least 2 different teams are represented
   *
   * @returns True if game has enough ready players across multiple teams
   */
  public canStartCountdown(): boolean {
    // At least 2 players seated
    if (!isTestMode() && this.seatedPlayers.length < 2) {
      return false;
    }

    // All seated players are ready
    if (!this.seatedPlayers.every((player: Player) => this.isPlayerReady(player))) {
      return false;
    }

    if (isTestMode()) return true;

    // At least 2 teams represented
    const teams: Set<number> = new Set(this.occupiedSeats.map((tableSeat: TableSeat) => tableSeat.teamNumber));

    return teams.size >= (isTestMode() ? 1 : MIN_READY_TEAMS_COUNT);
  }

  public async prepareGameCountdown(): Promise<void> {
    if (this.game && this.game.state !== GameState.WAITING) {
      return;
    }

    await this.loadPlayerStatsForSeated();

    if (!this.game) {
      let towersGame: TowersGameWithRelations | null = await prisma.towersGame.findFirst({
        where: { tableId: this.id, state: GameState.WAITING },
        include: getTowersGameIncludes(),
      });

      if (!towersGame) {
        towersGame = await prisma.towersGame.create({
          data: {
            tableId: this.id,
            state: GameState.WAITING,
          },
          include: getTowersGameIncludes(),
        });
      }

      this.game = new Game({ ...towersGame, table: this });
    }

    this.game.startCountdown();
  }

  public checkIfMinimumTeamsPlaying(): boolean {
    const activeTeams: Set<number> = new Set(
      this.occupiedSeats.filter((seat: TableSeat) => seat.occupiedByPlayerId).map((seat: TableSeat) => seat.teamNumber),
    );

    return activeTeams.size >= (isTestMode() ? 1 : MIN_READY_TEAMS_COUNT);
  }

  public async loadPlayerStatsForSeated(): Promise<void> {
    const tableSeatedPlayerIds: string[] = this.seatedPlayers.map((player: Player) => player.id);
    const loadedPlayers: Player[] = await PlayerFactory.loadMany(tableSeatedPlayerIds);

    for (const player of loadedPlayers) {
      const state: PlayerState | undefined = this.playersState.get(player.id);
      if (state) state.player = player;
    }
  }

  // --------------------------------------------------
  // Serialization
  // --------------------------------------------------

  public toJSON(): TableJSON {
    return {
      id: this.id,
      tableSeats: [...this.tableSeats.values()].map((tableSeat: TableSeat) => tableSeat.toJSON()),
      playersState: [...this.playersState.values()].map((state: PlayerState) => ({
        player: state.player.toJSON(),
        isReady: state.isReady,
        isPlaying: state.isPlaying,
      })),
      game: this.game?.toJSON(),
    };
  }
}
