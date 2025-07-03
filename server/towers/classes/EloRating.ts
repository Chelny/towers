export interface EloResult {
  userId: string
  oldRating: number
  newRating: number
  delta: number
}

export interface EloUserRating {
  userId: string
  rating: number
}

export interface EloTeam {
  teamNumber: number
  users: EloUserRating[]
  placement: number // 1 = winners, 2 = second place, ...
}

const avg = (ns: number[]): number => ns.reduce((s: number, n: number) => s + n, 0) / ns.length

export class EloRating {
  private static readonly K: number = 16

  public static rateTeams(teams: Map<number, EloUserRating[]>, winnerIds: string[]): EloResult[] {
    const teamsPlayed: EloTeam[] = this.assignPlacements(teams, winnerIds)
    return this.calc(teamsPlayed)
  }

  /**
   * Assign placement numbers to teams dynamically based on winners.
   *
   * @param teams Map of teamNumber => EloUserRating[]
   * @param winners array of winning userIds
   * @returns EloTeam[] with placement assigned
   */
  private static assignPlacements(teams: Map<number, EloUserRating[]>, winners: string[]): EloTeam[] {
    const winningTeams: EloTeam[] = []
    const losingTeams: EloTeam[] = []

    for (const [teamNumber, users] of teams.entries()) {
      const isWinnerTeam: boolean = users.some((p: EloUserRating) => winners.includes(p.userId))
      const team: EloTeam = {
        teamNumber,
        users,
        placement: 0, // Temporary value
      }

      if (isWinnerTeam) {
        winningTeams.push(team)
      } else {
        losingTeams.push(team)
      }
    }

    // Sort losing teams by avg rating descending (optional)
    losingTeams.sort((a: EloTeam, b: EloTeam) => {
      const avgA: number = avg(a.users.map((u: EloUserRating) => u.rating))
      const avgB: number = avg(b.users.map((u: EloUserRating) => u.rating))
      return avgB - avgA
    })

    // Assign placements
    winningTeams.forEach((t: EloTeam) => (t.placement = 1))
    losingTeams.forEach((t: EloTeam, index: number) => (t.placement = index + 2))

    return [...winningTeams, ...losingTeams]
  }

  /**
   * Calculates new ratings for an arbitrary number of teams.
   *
   * Algorithm:
   *  1. Compare every team to every other team (pair-wise Elo).
   *  2. Sum the Δ from all pairings for each team.
   *  3. Apply the same team-delta to every player on that team.
   */
  private static calc(teams: EloTeam[]): EloResult[] {
    const results: Map<string, EloResult> = new Map<string, EloResult>()

    for (const teamA of teams) {
      let deltaSum: number = 0

      for (const teamB of teams) {
        if (teamA === teamB) continue

        const sA: number =
          teamA.placement < teamB.placement
            ? 1 // Win
            : teamA.placement > teamB.placement
              ? 0 // Loss
              : 0.5 // Draw

        const rA: number = avg(teamA.users.map((p: EloUserRating) => p.rating))
        const rB: number = avg(teamB.users.map((p: EloUserRating) => p.rating))
        const expA: number = 1 / (1 + 10 ** ((rB - rA) / 400))

        deltaSum += EloRating.K * (sA - expA)
      }

      const teamDelta: number = Math.round(deltaSum)

      teamA.users.forEach((u: EloUserRating) => {
        results.set(u.userId, {
          userId: u.userId,
          oldRating: u.rating,
          newRating: u.rating + teamDelta,
          delta: teamDelta,
        })
      })
    }

    return [...results.values()]
  }
}
