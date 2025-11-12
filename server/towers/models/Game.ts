import { GameState, TableChatMessageType } from "db";
import type { PlayerState, Table } from "@/server/towers/models/Table";
import { DEFAULT_GAME_RATING, MIN_READY_TEAMS_COUNT } from "@/constants/game";
import { RedisEvents } from "@/constants/socket-events";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { publishRedisEvent } from "@/server/redis/publish";
import { PlayerFactory } from "@/server/towers/factories/PlayerFactory";
import { Board } from "@/server/towers/game/Board";
import { CipherHeroManager } from "@/server/towers/game/CipherHeroManager";
import { EloRating, EloResult, EloUserRating } from "@/server/towers/game/EloRating";
import { PlayerTowersGame } from "@/server/towers/game/PlayerTowersGame";
import { Player, PlayerJSON } from "@/server/towers/models/Player";
import { TableSeat } from "@/server/towers/models/TableSeat";
import { isTestMode } from "@/server/towers/utils/test";

const COUNTDOWN_START_NUMBER = 15;
const VALID_GAME_MIN_SECONDS = 15;

type RemainingPlayingTeam = { teamNumber: number; players: Player[] }

export interface GameProps {
  id: string
  tableId: string
  table: Table
  state: GameState
  startedAt: Date | null
  endedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface GameJSON {
  readonly id: string
  readonly tableId: string
  readonly state: GameState
  readonly startedAt: string | null
  readonly endedAt: string | null
  readonly playerIdsThisRound: string[]
  readonly countdown: number | null
  readonly timer: number | null
  readonly winners: PlayerJSON[]
  readonly createdAt: string
  readonly updatedAt: string
}

/**
 * Controls the overall state and flow of a Towers game session at a table.
 *
 * Manages game state transitions, countdowns, timers, and player game instances.
 */
export class Game {
  public readonly id: string;
  public readonly tableId: string;
  private table: Table;

  public _state: GameState;
  public startedAt: Date | null;
  public endedAt: Date | null;
  public countdown: number | null = COUNTDOWN_START_NUMBER;
  private countdownIntervalId: NodeJS.Timeout | null = null;
  public timer: number | null = null;
  private gameTimerIntervalId: NodeJS.Timeout | null = null;

  private playersThisRound: Player[] = [];
  private playerGameInstances: Map<string, PlayerTowersGame> = new Map<string, PlayerTowersGame>();
  private isUsersPlayingListSaved: boolean = false;
  private isGameOver: boolean = false;
  public winners: Player[] = [];

  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: GameProps) {
    this.id = props.id;
    this.tableId = props.tableId;
    this.table = props.table;
    this._state = props.state;
    this.startedAt = props.startedAt;
    this.endedAt = props.endedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public get state(): GameState {
    return this._state;
  }

  public set state(state: GameState) {
    // Clear board before starting a new game
    if (state === GameState.COUNTDOWN && state !== this._state) {
      this.table.seats.forEach((tableSeat: TableSeat) => tableSeat.clearSeatGame());
      this.emitTableDataToAll();
    }

    this._state = state;
    this.emitGameStateToAll();
    this.syncStateToDB();
  }

  public get playerIdsThisRound(): string[] {
    return this.playersThisRound.map((player: Player) => player.id);
  }

  // -----------------------
  // Countdown
  // -----------------------

  public startCountdown(): void {
    if (this.countdown == null) {
      this.countdown = COUNTDOWN_START_NUMBER;
    }

    this.state = GameState.COUNTDOWN;

    this.emitCountdownToAll();

    this.countdownIntervalId = setInterval(() => {
      if (this.countdown !== null) {
        logger.debug(`Countdown: ${this.countdown}`);

        if (this.countdown > 1) {
          this.countdown -= 1;
          this.emitCountdownToAll();

          if (!this.table.checkIfMinimumTeamsPlaying()) {
            this.clearCountdown();
            logger.debug("Game Over: Not enough ready users or teams");
            this.gameOver();
          }
        } else if (this.countdown === 1) {
          this.clearCountdown();
          this.startGame();
        }
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }

    this.countdown = null;
    this.countdownIntervalId = null;
    this.emitCountdownToAll();
  }

  // -----------------------
  // Game
  // -----------------------

  private async startGame(): Promise<void> {
    this.state = GameState.PLAYING;
    this.playersThisRound = [];

    // Initialize boards and set partner boards for all occupied seats
    const occupiedSeats: TableSeat[] = this.table.occupiedSeats;

    const playerIds: string[] = occupiedSeats.map((tableSeat: TableSeat) => tableSeat.occupiedByPlayerId!);
    const loadedPlayers: Player[] = await PlayerFactory.loadMany(playerIds);

    occupiedSeats.forEach((tableSeat: TableSeat) => {
      const player: Player | undefined = loadedPlayers.find(
        (player: Player) => player.id === tableSeat.occupiedByPlayerId,
      );
      if (player) {
        this.table.setPlayerPlaying(player.id, true);
        tableSeat.occupiedByPlayer = player;
        tableSeat.initialize();
      }
    });

    for (let index = 0; index < occupiedSeats.length; index++) {
      const seat: TableSeat = occupiedSeats[index];

      // Pair boards with partner if exists
      const partnerIndex: number = index % 2 === 0 ? index + 1 : index - 1;
      const partnerSeat: TableSeat = occupiedSeats[partnerIndex];

      if (partnerSeat && partnerSeat.board && seat.board) {
        seat.board.partnerBoard = partnerSeat.board;
        seat.board.partnerSide = index % 2 === 0 ? "right" : "left";
      }

      const player: Player | null = seat.occupiedByPlayer;
      if (!player) return;

      // Only include ready players in this round
      const playerState: PlayerState | undefined = this.table.playersState.get(player.id);
      if (playerState?.isReady) {
        this.playersThisRound.push(player);

        const gameInstance: PlayerTowersGame = new PlayerTowersGame(playerState.player, this.table);
        this.playerGameInstances.set(player.id, gameInstance);

        gameInstance.startGameLoop();

        playerState.isPlaying = true;
        this.table.setPlayerPlaying(player.id, true);

        this.emitTableDataToUser(playerState);
      }
    }

    this.startGameTimer();
  }

  private startGameTimer(): void {
    if (this.timer == null) {
      this.timer = 0;
    }

    this.emitTimerToAll();

    this.gameTimerIntervalId = setInterval(() => {
      if (this.timer !== null) {
        logger.debug(`Game Timer: ${this.timer} seconds`);

        if (this.checkIfGameOver()) {
          const finalTimer: number | null = this.timer;

          this.clearGameTimer();

          const aliveTeams: RemainingPlayingTeam[] = this.getRemainingPlayingTeams();

          if (aliveTeams.length === 0) {
            logger.debug("Game Over — No alive teams.");
            this.gameOver(finalTimer);
            return;
          }

          const winningTeam: RemainingPlayingTeam = aliveTeams[0];
          logger.debug(`Game Over — Winning team: ${winningTeam.players.map((player: Player) => player.username)}`);
          this.gameOver(finalTimer, winningTeam.players);
          return;
        }

        if (
          !this.isUsersPlayingListSaved &&
          this.timer >= VALID_GAME_MIN_SECONDS &&
          (this.table.checkIfMinimumTeamsPlaying() || isTestMode())
        ) {
          const activePlayers: Player[] = [...this.table.playersState.values()]
            .filter((state: PlayerState) => state.isPlaying)
            .map((state: PlayerState) => state.player);

          this.playersThisRound = activePlayers;
          this.isUsersPlayingListSaved = true;

          logger.debug(`Rated players locked: ${JSON.stringify(this.playersThisRound)}`);
        }

        this.timer += 1;
        this.emitTimerToAll();

        if (this.timer <= VALID_GAME_MIN_SECONDS && !this.table.checkIfMinimumTeamsPlaying()) {
          const finalTimer: number | null = this.timer;

          this.clearGameTimer();

          logger.debug(
            `Game Over: Not enough users or teams playing within the first ${VALID_GAME_MIN_SECONDS} seconds.`,
          );
          this.gameOver(finalTimer);
        }
      }
    }, 1000);
  }

  private clearGameTimer(isEmit: boolean = false): void {
    if (this.gameTimerIntervalId) {
      clearInterval(this.gameTimerIntervalId);
    }

    this.timer = null;
    this.gameTimerIntervalId = null;

    if (isEmit) {
      this.emitTimerToAll();
    }
  }

  /**
   * Returns a list of currently active teams in the game.
   *
   * A team is considered alive if at least one of its users has a valid board
   * that is not marked as game over.
   *
   * This method:
   * - Groups all occupied seats by their `teamNumber`
   * - Filters out teams where all players have missing or game-over boards
   *
   * @returns An array of objects where each entry contains:
   *   - `teamNumber`: the numeric team identifier
   *   - `players`: an array of `Player` instances that belong to that team
   */
  private getRemainingPlayingTeams(): RemainingPlayingTeam[] {
    const teams: Map<number, Player[]> = new Map<number, Player[]>();

    // Group players by team number
    for (let index = 0; index < this.table.seatedPlayers.length; index++) {
      const player: Player = this.table.seatedPlayers[index];

      const seat: TableSeat | undefined = this.table.findSeatByPlayer(player);
      if (!seat || typeof seat.teamNumber === "undefined") continue;

      let team: Player[] | undefined = teams.get(seat.teamNumber);

      if (!team) {
        team = [];
        teams.set(seat.teamNumber, team);
      }

      team.push(player);
    }

    // Filter only playing teams
    return [...teams.entries()]
      .map(([teamNumber, players]: [number, Player[]]) => ({ teamNumber, players }))
      .filter(({ players }: { players: Player[] }) =>
        players.some((player: Player) => {
          const seat: TableSeat | undefined = this.table.findSeatByPlayer(player);
          const board: Board | null | undefined = seat?.board;
          return board && !board.isGameOver;
        }),
      );
  }

  /**
   * Checks whether the game is over based on remaining active teams.
   *
   * A team is considered "alive" if at least one user on that team has a board and is not marked as game over.
   * The game ends when only one such team remains.
   *
   * @returns `true` if the game is over and a winner is declared, otherwise `false`.
   */
  private checkIfGameOver(): boolean {
    return this.getRemainingPlayingTeams().length < (isTestMode() ? 1 : MIN_READY_TEAMS_COUNT);
  }

  /**
   * Finalizes the game state and stops all active game loops.
   *
   * - Marks the game as over.
   * - Stops all `PlayerTowersGame` loops.
   * - Clears player game instances.
   * - Determines if the game ended too early (under `VALID_GAME_MIN_SECONDS`).
   * - Emits the game-over state to all clients.
   * - Waits 10 seconds before resetting the game.
   *
   * @param finalTimer - The number of seconds the game lasted (used to check early exit).
   * @param winners - The winning players.
   */
  private async gameOver(finalTimer: number | null = null, winners: Player[] = []): Promise<void> {
    if (this.isGameOver) return;
    this.isGameOver = true;
    logger.debug("Game stopped.");

    this.playerGameInstances.forEach((playerTowersGame: PlayerTowersGame) => playerTowersGame.stopGameLoop());
    this.playerGameInstances.clear();

    this.state = GameState.GAME_OVER;

    const isEndedTooEarly: boolean = finalTimer !== null && finalTimer <= VALID_GAME_MIN_SECONDS;
    const playerIdsThisRound: string[] = isEndedTooEarly ? [] : this.playerIdsThisRound;
    this.winners = isEndedTooEarly ? [] : winners;
    const winnerIds: string[] = winners.map((player: Player) => player.id);

    for (const playerId of playerIdsThisRound) {
      const playerState: PlayerState | undefined = [...this.table.playersState.values()].find(
        (playerState: PlayerState) => playerState.player.id === playerId,
      );
      const player: Player | undefined = playerState?.player;
      if (!player) continue;

      this.table.setPlayerPlaying(player.id, false);

      if (winnerIds.includes(playerId)) {
        player.stats?.recordWin();

        if (player.stats?.isHeroEligible()) {
          const heroCode: string = CipherHeroManager.generateHeroCode(player.id);
          await prisma.towersTableChatMessage.create({
            data: {
              playerId: player.id,
              tableId: this.tableId,
              type: TableChatMessageType.HERO_CODE,
              textVariables: { heroCode },
              visibleToUserId: player.id,
            },
          });
        }
      } else {
        player.stats?.recordLoss();
      }
    }

    if (!isEndedTooEarly && this.table.isRated) {
      const roundTeams: Map<number, EloUserRating[]> = new Map<number, EloUserRating[]>();

      for (const player of this.playersThisRound) {
        const seat: TableSeat | undefined = this.table.findSeatByPlayer(player);
        if (!seat) continue;

        if (!roundTeams.has(seat.teamNumber)) {
          roundTeams.set(seat.teamNumber, []);
        }

        if (player.stats) {
          roundTeams.get(seat.teamNumber)!.push({
            playerId: player.id,
            rating: player.stats?.rating,
          });
        }
      }

      const ratingResults: EloResult[] = EloRating.rateTeams(roundTeams, winnerIds);

      for (const result of ratingResults) {
        let player: Player | undefined;

        for (let index = 0; index < this.table.seats.length; index++) {
          const seat: TableSeat = this.table.seats[index];

          if (seat.occupiedByPlayer && seat.occupiedByPlayerId === result.playerId) {
            player = seat.occupiedByPlayer;
            break;
          }
        }

        if (!player) continue;

        player.stats?.setRating(result.newRating);

        await prisma.towersTableChatMessage.create({
          data: {
            playerId: player.id,
            tableId: this.tableId,
            type: TableChatMessageType.GAME_RATING,
            textVariables: {
              username: player.username,
              oldRating: result.oldRating,
              newRating: result.newRating,
            },
          },
        });
      }
    }

    this.emitGameOverToAll();

    setTimeout(() => this.reset(), 10_000);
  }

  private reset(): void {
    for (const state of this.table.playersState.values()) {
      const player: Player = state.player;

      const seat: TableSeat | undefined = this.table.findSeatByPlayer(player);
      if (seat?.board) {
        seat.board.isGameOver = true;
      }

      state.isReady = false;
      state.isPlaying = false;

      this.emitTableDataToUser(state);
    }

    this.playersThisRound = [];
    this.state = GameState.WAITING;
    this.clearCountdown();
    this.clearGameTimer();
    this.isGameOver = false;
    this.winners = [];
  }

  /**
   * Handles logic when a user leaves the table during a game round.
   * - If the game is in countdown or early game phase (<= 15s), and valid teams are not present, game ends.
   * - If the game is playing (any time), and valid teams are NOT present after departure, game ends and last valid players become winners.
   * - Also removes the user from the current `playerIdsThisRound` list if necessary.
   * - Emits the updated GAME_OVER state to all users.
   *
   * @param player - The user who left the table
   */
  public handleUserDepartureMidGame(player: Player): void {
    const isEarlyExitDuringCountdown: boolean = this.state === GameState.COUNTDOWN;
    const isEarlyExitDuringPlay: boolean =
      this.state === GameState.PLAYING && this.timer !== null && this.timer <= VALID_GAME_MIN_SECONDS;
    const isMidGame: boolean =
      this.state === GameState.PLAYING && this.timer !== null && this.timer > VALID_GAME_MIN_SECONDS;

    // Handle departure during countdown or early game
    if (isEarlyExitDuringCountdown || isEarlyExitDuringPlay) {
      this.playersThisRound = this.table.checkIfMinimumTeamsPlaying()
        ? this.playersThisRound.filter((playerThisRound: Player) => playerThisRound.id !== player.id)
        : [];
      return;
    }

    // Handle mid-game user exit — check if game is still valid
    if (isMidGame && !this.table.checkIfMinimumTeamsPlaying()) {
      // Determine remaining players as winners
      this.winners = Array.from(this.table.playersState.values())
        .map((playerState: PlayerState) => playerState.player)
        .filter((player: Player) => this.playerIdsThisRound.includes(player.id));
    }
  }

  // -----------------------
  // Emit + Sync
  // -----------------------

  private emitTableDataToAll(): void {
    for (const state of this.table.playersState.values()) {
      this.emitTableDataToUser(state);
    }
  }

  private async emitTableDataToUser(state: PlayerState): Promise<void> {
    await publishRedisEvent(RedisEvents.TABLE_PLAYER_STATE_UPDATE, {
      tableId: this.table.id,
      playerId: state.player.id,
      isReady: state.isReady,
      isPlaying: state.isPlaying,
    });
  }

  private async emitCountdownToAll(): Promise<void> {
    await publishRedisEvent(RedisEvents.GAME_COUNTDOWN, { tableId: this.table.id, countdown: this.countdown });
  }

  private async emitTimerToAll(): Promise<void> {
    await publishRedisEvent(RedisEvents.GAME_TIMER, { tableId: this.table.id, timer: this.timer });
  }

  private async emitGameStateToAll(): Promise<void> {
    await publishRedisEvent(RedisEvents.GAME_STATE, { tableId: this.table.id, gameState: this.state });
  }

  private async emitGameOverToAll(): Promise<void> {
    for (const state of this.table.playersState.values()) {
      await this.emitGameOverToUser(state.player);
    }
  }

  private async emitGameOverToUser(player: Player): Promise<void> {
    const isWinner: boolean = this.winners.some((winner: Player) => winner.id === player.id);
    const isPlayedThisRound: boolean = this.playerIdsThisRound.includes(player.id);

    // Collect rating info for all players who actually played this round
    const rating: { playerId: string; rating: number }[] = Array.from(this.table.playersState.values())
      .filter(({ player }: { player: Player }) => this.playerIdsThisRound.includes(player.id))
      .map(({ player }: { player: Player }) => ({
        playerId: player.id,
        rating: player.stats?.rating ?? DEFAULT_GAME_RATING,
      }));

    // player.emit(SocketEvents.GAME_OVER, {
    //   winners: this.winners.map((winner: Player) => winner.toJSON()),
    //   isWinner,
    //   isPlayedThisRound,
    //   rating, // FIXME: Not sent in client Table.tsx
    // });

    await publishRedisEvent(RedisEvents.GAME_OVER, {
      tableId: this.table.id,
      winners: this.winners.map((winner: Player) => winner.toJSON()),
      isWinner,
      isPlayedThisRound,
    });
  }

  private async syncStateToDB(
    data?: Partial<{ state: GameState; startedAt: Date | null; endedAt: Date | null }>,
  ): Promise<void> {
    await prisma.towersGame.update({
      where: { id: this.id },
      data: {
        state: data?.state ?? this._state,
        startedAt: data?.startedAt ?? this.startedAt,
        endedAt: data?.endedAt ?? this.endedAt,
        updatedAt: new Date(),
      },
    });
  }

  public toJSON(): GameJSON {
    return {
      id: this.id,
      tableId: this.tableId,
      state: this._state,
      startedAt: this.startedAt?.toISOString() ?? null,
      endedAt: this.endedAt?.toISOString() ?? null,
      playerIdsThisRound: this.playerIdsThisRound,
      countdown: this.countdown,
      timer: this.timer,
      winners: this.winners.map((winner: Player) => winner.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
