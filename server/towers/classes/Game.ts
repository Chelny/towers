import { createId } from "@paralleldrive/cuid2"
import type { Table } from "@/server/towers/classes/Table"
import { MIN_READY_TEAMS_COUNT } from "@/constants/game"
import { SocketEvents } from "@/constants/socket-events"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TowersGameState } from "@/enums/towers-game-state"
import { logger } from "@/lib/logger"
import { Board } from "@/server/towers/classes/Board"
import { CipherHeroManager } from "@/server/towers/classes/CipherHeroManager"
import { EloRating, EloResult, EloUserRating } from "@/server/towers/classes/EloRating"
import { PlayerTowersGame } from "@/server/towers/classes/PlayerTowersGame"
import { TableSeat } from "@/server/towers/classes/TableSeat"
import { TableSeatManager } from "@/server/towers/classes/TableSeatManager"
import { User, UserPlainObject } from "@/server/towers/classes/User"
import { isTestMode } from "@/server/towers/utils/test"
import { delay } from "@/server/towers/utils/timers"

export interface GamePlainObject {
  id: string
  playerIdsThisRound: string[]
  state: TowersGameState
  countdown: number | null
  timer: number | null
  winners: UserPlainObject[]
}

type RoundPlayer = { userId: string; teamNumber: number }

/**
 * Controls the overall state and flow of a Towers game session at a table.
 *
 * Manages game state transitions, countdowns, timers, and player game instances.
 */
export class Game {
  public id: string
  private table: Table
  private tableSeatManager: TableSeatManager
  private playersThisRound: RoundPlayer[] = []
  private isUsersPlayingListSaved: boolean = false
  private _state: TowersGameState = TowersGameState.WAITING
  public countdown: number | null = Game.COUNTDOWN_START_NUMBER
  private countdownIntervalId: NodeJS.Timeout | null = null
  public timer: number | null = null
  private gameTimerIntervalId: NodeJS.Timeout | null = null
  private isGameOver: boolean = false
  public winners: User[] = []
  private playerGameInstances: Map<string, PlayerTowersGame> = new Map<string, PlayerTowersGame>()
  private static COUNTDOWN_START_NUMBER: number = 3 // TODO: Put it back to 15 seconds
  private static VALID_GAME_MIN_SECONDS: number = 15

  /**
   * Creates a new Game instance.
   *
   * @param table - The game table where this session is taking place.
   * @param tableSeatManager - The manager responsible for user-seat assignments.
   */
  constructor(table: Table, tableSeatManager: TableSeatManager) {
    this.id = createId()
    this.table = table
    this.tableSeatManager = tableSeatManager
  }

  public get playerIdsThisRound(): string[] {
    return this.playersThisRound.map((p: RoundPlayer) => p.userId)
  }

  public set state(state: TowersGameState) {
    // Clear board before starting a new game
    if (state === TowersGameState.COUNTDOWN && state !== this._state) {
      this.table.seats.forEach((seat: TableSeat) => {
        seat.clearSeatGame()
      })

      this.emitTableDataToAll()
    }

    this._state = state
    this.emitGameStateToAll()
  }

  public get state(): TowersGameState {
    return this._state
  }

  /**
   * Checks whether the game has the minimum required conditions to continue:
   * - At least 2 seated users
   * - All seated users are ready
   * - At least 2 different teams are represented
   *
   * Used to determine if a game can start or continue after a player leaves.
   *
   * @returns True if game has enough ready players across multiple teams
   */
  public checkIfHasMinimumTeams(): boolean {
    const seatedUsers: User[] = this.table.users.filter(
      (user: User) => typeof user.getSeatNumber(this.table.id) !== "undefined",
    )

    if (seatedUsers.length < 2) return false // Need at least two seated users

    // All seated users must be ready
    if (!seatedUsers.every((user: User) => user.isReadyInTable(this.table.id))) return false

    if (isTestMode()) return true

    // Group users by team
    const teams: Map<number, User[]> = new Map<number, User[]>()
    for (const user of seatedUsers) {
      if (typeof user.getSeatNumber(this.table.id) === "undefined") continue

      // @ts-ignore
      const team: number = Math.ceil(user.getSeatNumber(this.table.id) / 2) // Teams: 1-2, 3-4, 5-6, 7-8
      if (!teams.has(team)) {
        teams.set(team, [])
      }
      teams.get(team)!.push(user)
    }

    for (const user of seatedUsers) {
      const seat: TableSeat | undefined = this.tableSeatManager.getUserSeat(user.user.id)
      if (typeof seat === "undefined") continue

      const teamNumber: number = seat.teamNumber
      if (!teams.has(teamNumber)) {
        teams.set(teamNumber, [])
      }
      teams.get(teamNumber)!.push(user)
    }

    // Ensure at least two different teams have ready players
    return teams.size >= MIN_READY_TEAMS_COUNT
  }

  public startCountdown(): void {
    if (this.countdown === null) {
      this.countdown = Game.COUNTDOWN_START_NUMBER
    }

    this.state = TowersGameState.COUNTDOWN

    this.emitCountdownToAll()

    this.countdownIntervalId = setInterval(() => {
      if (this.countdown !== null) {
        logger.debug(`Countdown: ${this.countdown}`)

        if (this.countdown > 1) {
          this.countdown -= 1
          this.emitCountdownToAll()

          if (!this.checkIfHasMinimumTeams()) {
            this.clearCountdown()
            logger.debug("Game Over: Not enough ready users or teams")
            this.gameOver()
          }
        } else if (this.countdown === 1) {
          this.clearCountdown()
          this.startGame()
        }
      }
    }, 1000)
  }

  private clearCountdown(): void {
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId)
    }

    this.countdown = null
    this.countdownIntervalId = null
    this.emitCountdownToAll()
  }

  private startGame(): void {
    // this.table.users.forEach((user: User) => {
    //   const seat: TableSeat | undefined = this.tableSeatManager.getUserSeat(user.user.id)

    //   if (
    //     typeof seat !== "undefined" && typeof user.getSeatNumber(this.table.id) !== "undefined" &&
    //     user.isReadyInTable(this.table.id)
    //   ) {
    //     seat.initialize()
    //     this.playersThisRound.push({ userId: user.user.id, teamNumber: seat.teamNumber })

    //     const gameInstance: PlayerTowersGame = new PlayerTowersGame(
    //       user,
    //       this.table.id,
    //       this.table.users,
    //       this.table.chat,
    //       this.tableSeatManager,
    //     )

    //     this.playerGameInstances.set(user.user.id, gameInstance)

    //     gameInstance.startGameLoop()

    //     user.updateJoinedTable(this.table.id, { isPlaying: true })
    //   }

    //   this.emitTableDataToUser(user)
    // })

    this.table.seats.filter((seat: TableSeat) => seat.occupiedBy).forEach((seat: TableSeat) => seat.initialize())

    this.table.seats
      .filter((seat: TableSeat) => seat.occupiedBy)
      .forEach((seat: TableSeat, index: number) => {
        // Always pair up if there is a partner, regardless of index
        const partnerIndex: number = index % 2 === 0 ? index + 1 : index - 1
        const partnerSeat: TableSeat | undefined = this.table.seats[partnerIndex]

        if (partnerSeat?.occupiedBy && seat.board && partnerSeat.board) {
          seat.board.partnerBoard = partnerSeat.board

          if (index % 2 === 0) {
            seat.board.partnerSide = "right"
          } else {
            seat.board.partnerSide = "left"
          }
        }

        const user: User | null = seat.occupiedBy

        if (user && user.isReadyInTable(this.table.id)) {
          this.playersThisRound.push({ userId: user.user.id, teamNumber: seat.teamNumber })

          const gameInstance: PlayerTowersGame = new PlayerTowersGame(
            user,
            this.table.id,
            this.table.users,
            this.table.chat,
            this.tableSeatManager,
          )

          this.playerGameInstances.set(user.user.id, gameInstance)
          gameInstance.startGameLoop()
          user.updateJoinedTable(this.table.id, { isPlaying: true })
          this.emitTableDataToUser(user)
        }
      })

    this.startGameTimer()
  }

  private startGameTimer(): void {
    if (this.timer === null) {
      this.timer = 0
    }

    this.state = TowersGameState.PLAYING

    this.emitTimerToAll()

    this.gameTimerIntervalId = setInterval(() => {
      if (this.timer !== null) {
        logger.debug(`Game Timer: ${this.timer} seconds`)

        if (this.checkIfGameOver()) {
          const finalTimer: number | null = this.timer

          this.clearGameTimer()

          const aliveTeams: { teamNumber: number; users: User[] }[] = this.getActiveTeams()

          if (aliveTeams.length === 0) {
            logger.debug("Game Over — No alive teams.")
            this.gameOver(finalTimer)
            return
          }

          const winningTeam: { teamNumber: number; users: User[] } = aliveTeams[0]
          logger.debug(`Game Over — Winning team: ${winningTeam.users.map((user: User) => user.user?.username)}`)
          this.gameOver(finalTimer, winningTeam.users)
          return
        }

        if (
          !this.isUsersPlayingListSaved &&
          this.timer >= Game.VALID_GAME_MIN_SECONDS &&
          (this.checkIfHasMinimumTeams() || isTestMode())
        ) {
          this.playersThisRound = this.table.users
            .filter((u: User) => u.isPlayingInTable(this.table.id))
            .map((u: User) => {
              const seat: TableSeat | undefined = this.tableSeatManager.getUserSeat(u.user.id)
              return {
                userId: u.user.id,
                teamNumber: seat?.teamNumber ?? -1,
              }
            })

          this.isUsersPlayingListSaved = true
          logger.debug(`Rated players locked: ${JSON.stringify(this.playersThisRound)}`)
        }

        this.timer += 1
        this.emitTimerToAll()

        if (this.timer <= Game.VALID_GAME_MIN_SECONDS && !this.checkIfHasMinimumTeams()) {
          const finalTimer: number | null = this.timer

          this.clearGameTimer()

          logger.debug(
            `Game Over: Not enough users or teams playing within the first ${Game.VALID_GAME_MIN_SECONDS} seconds.`,
          )
          this.gameOver(finalTimer)
        }
      }
    }, 1000)
  }

  private clearGameTimer(isEmit: boolean = false): void {
    if (this.gameTimerIntervalId !== null) {
      clearInterval(this.gameTimerIntervalId)
    }

    this.timer = null
    this.gameTimerIntervalId = null

    if (isEmit) {
      this.emitTimerToAll()
    }
  }

  /**
   * Returns a list of currently active teams in the game.
   *
   * A team is considered alive if at least one of its users has a board
   * that exists and is not marked as game over.
   *
   * This method groups users by their `teamNumber` and filters out teams
   * where all members are either missing boards or have lost the game.
   *
   * @returns An array of tuples, where each tuple contains:
   *   - the team number (as `number`)
   *   - an array of `User` objects who belong to that team
   *     (including users with and without active boards)
   */
  private getActiveTeams(): { teamNumber: number; users: User[] }[] {
    const teams: Map<number, User[]> = new Map()

    for (const user of this.table.users) {
      const seat: TableSeat | undefined = this.tableSeatManager.getTableSeat(user)
      if (typeof seat === "undefined" || typeof seat.teamNumber === "undefined") continue

      if (!teams.has(seat.teamNumber)) {
        teams.set(seat.teamNumber, [])
      }

      teams.get(seat.teamNumber)!.push(user)
    }

    return Array.from(teams.entries())
      .map(([teamNumber, users]: [number, User[]]) => ({ teamNumber, users }))
      .filter(({ users }: { users: User[] }) =>
        users.some((user: User) => {
          const board: Board | null | undefined = this.tableSeatManager.getTableSeat(user)?.board
          return board && !board.isGameOver
        }),
      )
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
    return this.getActiveTeams().length < (isTestMode() ? 1 : MIN_READY_TEAMS_COUNT)
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
  private async gameOver(finalTimer: number | null = null, winners: User[] = []): Promise<void> {
    if (this.isGameOver) return
    this.isGameOver = true
    logger.debug("Game stopped.")

    this.playerGameInstances.forEach((playerTowersGame: PlayerTowersGame) => playerTowersGame.stopGameLoop())
    this.playerGameInstances.clear()

    this.state = TowersGameState.GAME_OVER

    const isEndedTooEarly: boolean = finalTimer !== null && finalTimer <= Game.VALID_GAME_MIN_SECONDS
    this.winners = isEndedTooEarly ? [] : winners
    const winnerIds: string[] = winners.map((user: User) => user.user?.id)
    const playerIdsThisRound: string[] = isEndedTooEarly ? [] : this.playerIdsThisRound

    for (const playerId of playerIdsThisRound) {
      const user: User | undefined = this.table.users.find((user: User) => user.user.id === playerId)
      if (!user) continue

      if (winnerIds.includes(playerId)) {
        user.stats.recordWin()

        if (user.stats.isHeroEligible()) {
          const heroCode: string = CipherHeroManager.generateHeroCode(user.user.id)
          this.table.chat.addMessage({
            user,
            type: TableChatMessageType.HERO_CODE,
            messageVariables: { heroCode },
            visibleToUserId: user.user.id,
          })
        }
      } else {
        user.stats.recordLoss()
      }
    }

    if (!isEndedTooEarly) {
      const roundTeams: Map<number, EloUserRating[]> = new Map<number, EloUserRating[]>()

      for (const { userId, teamNumber } of this.playersThisRound) {
        const user: User | undefined = this.table.users.find((u: User) => u.user.id === userId)
        if (!user) continue

        if (!roundTeams.has(teamNumber)) {
          roundTeams.set(teamNumber, [])
        }

        roundTeams.get(teamNumber)!.push({
          userId,
          rating: user.stats.rating,
        })
      }

      const ratingResults: EloResult[] = EloRating.rateTeams(roundTeams, winnerIds)

      ratingResults.forEach((result: EloResult) => {
        const user: User | undefined = this.table.users.find((u: User) => u.user.id === result.userId)

        if (typeof user !== "undefined") {
          user.stats.setRating(result.newRating)

          this.table.chat.addMessage({
            user,
            type: TableChatMessageType.GAME_RATING,
            messageVariables: {
              username: user.user.username,
              oldRating: result.oldRating,
              newRating: result.newRating,
            },
          })
        }
      })
    }

    this.emitGameOverToAll()

    await delay(10_000)

    this.reset()
  }

  private reset(): void {
    this.id = createId()
    this.playersThisRound = []
    this.state = TowersGameState.WAITING
    this.clearCountdown()
    this.clearGameTimer(true)
    this.isGameOver = false
    this.winners = []

    this.table.users.forEach((user: User) => {
      const seat: TableSeat | undefined = this.tableSeatManager.getUserSeat(user.user.id)

      if (seat?.board) {
        seat.board.isGameOver = true
      }

      user.updateJoinedTable(this.table.id, { isReady: false, isPlaying: false })

      this.emitTableDataToUser(user)
    })
  }

  /**
   * Synchronizes the current game state with a newly joined user.
   * Emits the appropriate game state events based on the current phase:
   * - `GAME_STATE` (always)
   * - `GAME_COUNTDOWN` if the game is in countdown
   * - `GAME_TIMER` if the game is actively playing
   * - `GAME_OVER` if the game is over
   *
   * @param user - The user to sync the game state with
   */
  public syncGameStateWithUser(user: User): void {
    user.socket.emit(SocketEvents.GAME_STATE, { gameState: this.state })

    if (this.state === TowersGameState.COUNTDOWN && this.countdown !== null) {
      user.socket.emit(SocketEvents.GAME_COUNTDOWN, { countdown: this.countdown })
    }

    if (this.state === TowersGameState.PLAYING && this.timer !== null) {
      user.socket.emit(SocketEvents.GAME_TIMER, { timer: this.timer })
    }

    if (this.state === TowersGameState.GAME_OVER) {
      this.emitGameOverToUser(user)
    }
  }

  /**
   * Handles logic when a user leaves the table during a game round.
   * - If the game is in countdown or early game phase (<= 15s), and valid teams are not present, game ends.
   * - If the game is playing (any time), and valid teams are NOT present after departure, game ends and last valid players become winners.
   * - Also removes the user from the current `playerIdsThisRound` list if necessary.
   * - Emits the updated GAME_OVER state to all users.
   *
   * @param user - The user who left the table
   */
  public handleUserDepartureMidGame(user: User): void {
    const isEarlyExitDuringCountdown: boolean = this.state === TowersGameState.COUNTDOWN
    const isEarlyExitDuringPlay: boolean =
      this.state === TowersGameState.PLAYING && this.timer !== null && this.timer <= Game.VALID_GAME_MIN_SECONDS
    const isMidGame: boolean =
      this.state === TowersGameState.PLAYING && this.timer !== null && this.timer > Game.VALID_GAME_MIN_SECONDS

    // Handle departure during countdown or early game
    if (isEarlyExitDuringCountdown || isEarlyExitDuringPlay) {
      this.playersThisRound = this.checkIfHasMinimumTeams()
        ? this.playersThisRound.filter((p: RoundPlayer) => p.userId !== user.user.id)
        : []
      return
    }

    // Handle mid-game user exit — check if game is still valid
    if (isMidGame && !this.checkIfHasMinimumTeams()) {
      // Determine remaining players as winners
      this.winners = this.table.users.filter(
        (u: User) => u.isPlayingInTable(this.table.id) && u.user.id !== user.user.id,
      )
    }
  }

  private emitTableDataToAll(): void {
    this.table.users.forEach((user: User) => {
      this.emitTableDataToUser(user)
    })
  }

  private emitTableDataToUser(user: User): void {
    user.socket.emit(SocketEvents.TABLE_DATA_UPDATED)
  }

  private emitGameStateToAll(): void {
    this.table.users.forEach((user: User) => {
      user.socket.emit(SocketEvents.GAME_STATE, { gameState: this.state })
    })
  }

  private emitCountdownToAll(): void {
    this.table.users.forEach((user: User) => {
      user.socket.emit(SocketEvents.GAME_COUNTDOWN, { countdown: this.countdown })
    })
  }

  private emitTimerToAll(): void {
    this.table.users.forEach((user: User) => {
      user.socket.emit(SocketEvents.GAME_TIMER, { timer: this.timer })
    })
  }

  private emitGameOverToAll(): void {
    this.table.users.forEach((user: User) => {
      this.emitGameOverToUser(user)
    })
  }

  private emitGameOverToUser(user: User): void {
    const isWinner: boolean = this.winners.some((winner: User) => winner.user.id === user.user.id)
    const isPlayedThisRound: boolean = this.playerIdsThisRound.includes(user.user.id)

    user.socket.emit(SocketEvents.GAME_OVER, {
      winners: this.winners.map((winner: User) => winner.toPlainObject()),
      isWinner,
      isPlayedThisRound,
      rating: this.table.users
        .filter((u: User) => this.playerIdsThisRound.includes(u.user.id))
        .map((u: User) => ({
          userId: u.user.id,
          rating: u.stats.rating,
        })),
    })
  }

  public toPlainObject(): GamePlainObject {
    return {
      id: this.id,
      playerIdsThisRound: this.playerIdsThisRound,
      state: this._state,
      countdown: this.countdown,
      timer: this.timer,
      winners: this.winners.map((winner: User) => winner.toPlainObject()),
    }
  }
}
