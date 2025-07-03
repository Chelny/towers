import { Board } from "@/server/towers/classes/Board"
import { TableSeat } from "@/server/towers/classes/TableSeat"
import { User } from "@/server/towers/classes/User"

/**
 * Manages the mapping between users and table seats.
 *
 * Provides utility methods to assign, unassign, and query seat data for users.
 */
export class TableSeatManager {
  private tableSeats: Map<string, TableSeat> = new Map<string, TableSeat>()

  /**
   * Assigns a user to a specific seat number, with validation.
   *
   * @param user The user to add.
   * @param seats The full list of seats for this table.
   * @param seatNumber The seat number the user wants to occupy.
   * @throws Error if seat number does not exist or if seat if already taken.
   */
  public assignSeat(user: User, seats: TableSeat[], seatNumber: number): void {
    if (this.hasSeat(user)) {
      this.unassignSeat(user)
    }

    const seat: TableSeat | undefined = seats.find((seat) => seat.seatNumber === seatNumber)

    if (typeof seat === "undefined") {
      throw new Error(`Seat #${seatNumber} does not exist.`)
    }

    if (seat.occupiedBy) {
      throw new Error(`Seat #${seatNumber} is already taken by ${seat.occupiedBy.user.username}.`)
    }

    seat.occupiedBy = user
    this.tableSeats.set(user.user.id, seat)
  }

  /**
   * Removes a user from their assigned seat, if present.
   *
   * @param user The user to remove.
   * @returns The seat that was freed, if any.
   */
  public unassignSeat(user: User): void {
    const seat: TableSeat | undefined = this.getTableSeat(user)

    if (typeof seat === "undefined") {
      throw new Error("The user is not seated.")
    }

    seat.clearSeatUser()
    this.tableSeats.delete(user.user.id)
  }

  /**
   * Retrieves a TableSeat for a specific user.
   *
   * @param user The user for whom we want the TableSeat.
   * @returns The TableSeat for the user.
   * @throws Error if the user is not seated.
   */
  public getTableSeat(user: User): TableSeat | undefined {
    return this.tableSeats.get(user.user.id)
  }

  /**
   * Retrieves a seat by its seat number.
   *
   * @param userId - The user ID mapped to the seat to retrieve.
   * @returns The matching TableSeat or undefined.
   */
  public getUserSeat(userId: string): TableSeat | undefined {
    return Array.from(this.tableSeats.values()).find((seat: TableSeat) => seat.occupiedBy?.user.id === userId)
  }

  public getSeatByBoard(board: Board): TableSeat | undefined {
    return Array.from(this.tableSeats.values()).find((seat: TableSeat) => seat.board === board)
  }

  /**
   * Retrieves all TableSeats for the current table.
   *
   * @returns An array of all TableSeats.
   */
  public getAllTableSeats(): TableSeat[] {
    return Array.from(this.tableSeats.values())
  }

  /**
   * Returns true if the user has a seat at the table.
   *
   * @param user The user to check.
   * @returns A boolean indicating if the user has a seat.
   */
  public hasSeat(user: User): boolean {
    return this.tableSeats.has(user.user.id)
  }
}
