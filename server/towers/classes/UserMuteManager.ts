export interface UserMutePeriod {
  mutedAt: Date
  unmutedAt: Date | null
}

export interface UserMuteManagerPlainObject {
  mutedUsers: {
    userId: string
    periods: UserMutePeriod[]
  }[]
}

/**
 * Manages a per-user ignore/mute list.
 * Mutes chat messages only.
 */
export class UserMuteManager {
  private readonly mutedUsers: Map<string, UserMutePeriod[]> = new Map<string, UserMutePeriod[]>()

  /**
   * Add a user ID to the ignore list.
   *
   * @param userId - ID of the user to ignore.
   */
  public muteUser(userId: string): void {
    const periods: UserMutePeriod[] = this.mutedUsers.get(userId) || []
    periods.push({ mutedAt: new Date(), unmutedAt: null })
    this.mutedUsers.set(userId, periods)
  }

  /**
   * Remove a user ID from the ignore list.
   *
   * @param userId - ID of the user to unignore.
   */
  public unmuteUser(userId: string): void {
    const periods: UserMutePeriod[] | undefined = this.mutedUsers.get(userId)
    if (!periods || periods.length === 0) return

    const lastPeriod: UserMutePeriod = periods[periods.length - 1]
    if (lastPeriod.unmutedAt === null) {
      lastPeriod.unmutedAt = new Date()
    }
  }

  /**
   * Check if a given user ID is ignored.
   *
   * @param userId - ID to check.
   * @returns `true` if ignored.
   */
  public isMuted(userId: string): boolean {
    const periods: UserMutePeriod[] | undefined = this.mutedUsers.get(userId)
    if (!periods) return false

    const last: UserMutePeriod = periods[periods.length - 1]
    return !!last && last.unmutedAt === null
  }

  /**
   * Get all mute periods.
   *
   * @param userId - The ID of the user to check.
   * @returns An array of mute periods (each with `mutedAt` and optional `unmutedAt`).
   */
  public getMutePeriods(userId: string): UserMutePeriod[] {
    return this.mutedUsers.get(userId) || []
  }

  public toPlainObject(): UserMuteManagerPlainObject {
    return {
      mutedUsers: Array.from(this.mutedUsers.entries()).map(([userId, periods]) => ({
        userId,
        periods,
      })),
    }
  }
}
