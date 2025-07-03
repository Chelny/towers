export interface UserStatsPlainObject {
  rating: number
  gamesCompleted: number
  wins: number
  loses: number
  streak: number
}

/**
 * Tracks statistics for a user, including rating and win/loss data.
 */
export class UserStats {
  public rating: number = 1200
  public gamesCompleted: number = 0
  public wins: number = 0
  public loses: number = 0
  public streak: number = 0
  private static HERO_CODE_ELIGIBILITY_TIME: number = 2 * 60 * 60 * 1000
  private static HERO_CODE_REQUIRED_WINS: number = 25
  private winTimestamps: number[] = []

  /**
   * Adds a win to the user's stats, updates streak and rating,
   * and tracks the time of the win for hero eligibility.
   */
  public recordWin(): void {
    this.wins += 1
    this.gamesCompleted += 1
    this.streak += 1

    const now: number = Date.now()
    this.winTimestamps.push(now)
    this.filterRecentWinTimestamps(now)
  }

  /**
   * Adds a loss to the user's stats, resets streak, and reduces rating.
   */
  public recordLoss(): void {
    this.loses += 1
    this.gamesCompleted += 1
  }

  /**
   * Replaces the player’s current Elo rating with a newly
   * calculated one.
   *
   * @param newRating - The rating returned by the Elo engine after the most recent *rated* match.
   */
  public setRating(newRating: number): void {
    this.rating = newRating
  }

  /**
   * Determines whether the user is eligible for a hero code,
   * defined as 25 wins within the last 2 hours.
   *
   * @returns true if eligible, false otherwise
   */
  public isHeroEligible(): boolean {
    const now: number = Date.now()
    this.filterRecentWinTimestamps(now)
    return this.winTimestamps.length >= UserStats.HERO_CODE_REQUIRED_WINS
  }

  /**
   * Filters win timestamps to only keep those within the hero window.
   * Called after each win to keep the list up-to-date.
   *
   * @param now - The current time in milliseconds
   */
  private filterRecentWinTimestamps(now: number): void {
    const cutoff: number = now - UserStats.HERO_CODE_ELIGIBILITY_TIME
    this.winTimestamps = this.winTimestamps.filter((timestamp: number) => timestamp >= cutoff)
  }

  public toPlainObject(): UserStatsPlainObject {
    return {
      rating: this.rating,
      gamesCompleted: this.gamesCompleted,
      wins: this.wins,
      loses: this.loses,
      streak: this.streak,
    }
  }
}
