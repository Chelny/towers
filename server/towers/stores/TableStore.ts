import { getCache, removeCache, setCache } from "@/server/redis-cache";
import { Table, TablePlainObject } from "@/server/towers/models/Table";
import { tables } from "@/server/towers/state";

const redisKey = (tableId: string) => `towers:table:${tableId}`;

export class TableStore {
  public static async get(tableId: string): Promise<Table | null> {
    const inMemory: Table | undefined = tables.get(tableId);
    if (inMemory) return inMemory;

    const cached: TablePlainObject | null = await getCache<TablePlainObject>(redisKey(tableId));
    if (!cached) return null;

    const table: Table = Table.fromJSON(cached);
    tables.set(tableId, table);
    return table;
  }

  public static async save(table: Table): Promise<void> {
    tables.set(table.id, table);
    await setCache(redisKey(table.id), table.toPlainObject());
  }

  public static async delete(tableId: string): Promise<void> {
    tables.delete(tableId);
    await removeCache(redisKey(tableId));
  }
}
