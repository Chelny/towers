import { TowersPlayerStats } from "db";
import { HERO_CODE_ELIGIBILITY_TIME, HERO_CODE_REQUIRED_WINS } from "@/constants/game";
import prisma from "@/lib/prisma";

export interface PlayerStatsJSON {
  readonly rating: number
  readonly gamesCompleted: number
  readonly wins: number
  readonly losses: number
  readonly streak: number
}

/**
 * Represents a player's statistics and ranking.
 *
 * Maps directly to `TowersPlayerStats` in the database.
 */
export class PlayerStats {
  public readonly id: string;
  public readonly playerId: string;
  public rating: number;
  public gamesCompleted: number;
  public wins: number;
  public losses: number;
  public streak: number;
  private winTimestamps: number[] = [];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(data: TowersPlayerStats) {
    this.id = data.id;
    this.playerId = data.playerId;
    this.rating = data.rating;
    this.gamesCompleted = data.gamesCompleted;
    this.wins = data.wins;
    this.losses = data.losses;
    this.streak = data.streak;
    this.winTimestamps = (data.winHistory as number[]) ?? [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public async recordWin(): Promise<void> {
    this.gamesCompleted++;
    this.wins++;
    this.streak++;
    this.addWinTimestamp();
    await this.save();
  }

  public async recordLoss(): Promise<void> {
    this.gamesCompleted++;
    this.losses++;
    this.streak = 0;
    await this.save();
  }

  public async setRating(newRating: number): Promise<void> {
    this.rating = newRating;
    await this.save();
  }

  /**
   * Determines whether the user is eligible for a hero code,
   * defined as 25 wins within the last 2 hours.
   *
   * @returns true if eligible, false otherwise
   */
  public isHeroEligible(): boolean {
    if (this.winTimestamps.length < HERO_CODE_REQUIRED_WINS) return false;
    return Date.now() - this.winTimestamps[0] <= HERO_CODE_ELIGIBILITY_TIME;
  }

  private addWinTimestamp(): void {
    const now: number = Date.now();

    this.winTimestamps.push(now);

    // Filter out any timestamps older than 2 hours and keep only the most recent 25 timestamps
    this.winTimestamps = this.winTimestamps
      .filter((timestamp: number) => now - timestamp <= HERO_CODE_ELIGIBILITY_TIME)
      .slice(-HERO_CODE_REQUIRED_WINS);
  }

  // --------------------------------------------------
  // Database
  // --------------------------------------------------

  public static async load(playerId: string): Promise<PlayerStats> {
    let data: TowersPlayerStats | null = await prisma.towersPlayerStats.findUnique({ where: { playerId } });

    if (!data) {
      data = await prisma.towersPlayerStats.create({
        data: { playerId, winHistory: [] },
      });
    }

    return new PlayerStats(data);
  }

  public async save(): Promise<void> {
    await prisma.towersPlayerStats.update({
      where: { playerId: this.playerId },
      data: {
        rating: this.rating,
        gamesCompleted: this.gamesCompleted,
        wins: this.wins,
        losses: this.losses,
        streak: this.streak,
        winHistory: this.winTimestamps,
      },
    });
  }

  // --------------------------------------------------
  // Serialization
  // --------------------------------------------------

  public toJSON(): PlayerStatsJSON {
    return {
      rating: this.rating,
      gamesCompleted: this.gamesCompleted,
      wins: this.wins,
      losses: this.losses,
      streak: this.streak,
    };
  }
}
