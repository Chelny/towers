export interface EloResult {
  playerId: string
  oldRating: number
  newRating: number
  delta: number
}

export interface EloUserRating {
  playerId: string
  rating: number
}

export interface EloTeam {
  teamNumber: number
  players: EloUserRating[]
  placement: number // 1 = winners, 2 = second place, ...
}

const avg = (ns: number[]): number => ns.reduce((s: number, n: number) => s + n, 0) / ns.length;

export class EloRating {
  private static readonly K: number = 16;

  public static rateTeams(teams: Map<number, EloUserRating[]>, winnerIds: string[]): EloResult[] {
    const teamsPlayed: EloTeam[] = this.assignPlacements(teams, winnerIds);
    return this.calc(teamsPlayed);
  }

  /**
   * Assign placement numbers to teams dynamically based on winners.
   *
   * @param teams Map of teamNumber => EloUserRating[]
   * @param winners array of winning userIds
   * @returns EloTeam[] with placement assigned
   */
  private static assignPlacements(teams: Map<number, EloUserRating[]>, winners: string[]): EloTeam[] {
    const winningTeams: EloTeam[] = [];
    const losingTeams: EloTeam[] = [];

    for (const [teamNumber, players] of teams.entries()) {
      const isWinnerTeam: boolean = players.some((eur: EloUserRating) => winners.includes(eur.playerId));
      const team: EloTeam = {
        teamNumber,
        players,
        placement: 0, // Temporary value
      };

      if (isWinnerTeam) {
        winningTeams.push(team);
      } else {
        losingTeams.push(team);
      }
    }

    // Sort losing teams by avg rating descending (optional)
    losingTeams.sort((eta: EloTeam, etb: EloTeam) => {
      const avgA: number = avg(eta.players.map((eur: EloUserRating) => eur.rating));
      const avgB: number = avg(etb.players.map((eur: EloUserRating) => eur.rating));
      return avgB - avgA;
    });

    // Assign placements
    winningTeams.forEach((et: EloTeam) => (et.placement = 1));
    losingTeams.forEach((et: EloTeam, index: number) => (et.placement = index + 2));

    return [...winningTeams, ...losingTeams];
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
    const results: Map<string, EloResult> = new Map<string, EloResult>();

    for (const teamA of teams) {
      let deltaSum: number = 0;

      for (const teamB of teams) {
        if (teamA === teamB) continue;

        const sA: number =
          teamA.placement < teamB.placement
            ? 1 // Win
            : teamA.placement > teamB.placement
              ? 0 // Loss
              : 0.5; // Draw

        const rA: number = avg(teamA.players.map((eur: EloUserRating) => eur.rating));
        const rB: number = avg(teamB.players.map((eur: EloUserRating) => eur.rating));
        const expA: number = 1 / (1 + 10 ** ((rB - rA) / 400));

        deltaSum += EloRating.K * (sA - expA);
      }

      const teamDelta: number = Math.round(deltaSum);

      teamA.players.forEach((eur: EloUserRating) => {
        results.set(eur.playerId, {
          playerId: eur.playerId,
          oldRating: eur.rating,
          newRating: eur.rating + teamDelta,
          delta: teamDelta,
        });
      });
    }

    return [...results.values()];
  }
}
