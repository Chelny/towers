import { getCache, removeCache, setCache } from "@/server/redis-cache";
import { TableSeat, TableSeatPlainObject } from "@/server/towers/models/TableSeat";
import { tableSeats } from "@/server/towers/state";

const redisKey = (tableSeatId: string) => `towers:tableSeat:${tableSeatId}`;

export class TableSeatStore {
  public static async get(tableSeatId: string): Promise<TableSeat | null> {
    const inMemory: TableSeat | undefined = tableSeats.get(tableSeatId);
    if (inMemory) return inMemory;

    const cached: TableSeatPlainObject | null = await getCache<TableSeatPlainObject>(redisKey(tableSeatId));
    if (!cached) return null;

    const tableSeat: TableSeat = TableSeat.fromJSON(cached);
    tableSeats.set(tableSeatId, tableSeat);
    return tableSeat;
  }

  public static async save(tableSeat: TableSeat): Promise<void> {
    tableSeats.set(tableSeat.id, tableSeat);
    await setCache(redisKey(tableSeat.id), tableSeat.toPlainObject());
  }

  public static async delete(tableSeatId: string): Promise<void> {
    tableSeats.delete(tableSeatId);
    await removeCache(redisKey(tableSeatId));
  }
}
