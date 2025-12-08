import { createId } from "@paralleldrive/cuid2";
import { TableBoot, TableBootProps } from "@/server/towers/classes/TableBoot";
import { PlayerManager } from "@/server/towers/managers/PlayerManager";

export class TableBootManager {
  private static tableBoots: Map<string, TableBoot> = new Map<string, TableBoot>();

  // ---------- Basic CRUD ------------------------------

  public static get(id: string): TableBoot | undefined {
    return this.tableBoots.get(id);
  }

  public static all(): TableBoot[] {
    return [...this.tableBoots.values()];
  }

  public static async create(props: Omit<TableBootProps, "id">): Promise<TableBoot> {
    const tableBoot: TableBoot = new TableBoot({ id: createId(), ...props });
    this.tableBoots.set(tableBoot.id, tableBoot);
    PlayerManager.updateLastActiveAt(props.booterPlayer.id);
    return tableBoot;
  }

  public static delete(id: string): void {
    this.tableBoots.delete(id);
  }
}
