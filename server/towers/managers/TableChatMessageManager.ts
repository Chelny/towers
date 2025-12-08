import { createId } from "@paralleldrive/cuid2";
import { ServerInternalEvents } from "@/constants/socket/server-internal";
import { publishRedisEvent } from "@/server/redis/publish";
import { TableChatMessage, TableChatMessageProps } from "@/server/towers/classes/TableChatMessage";
import { PlayerManager } from "@/server/towers/managers/PlayerManager";

export class TableChatMessageManager {
  private static tableChatMessages: Map<string, TableChatMessage> = new Map<string, TableChatMessage>();

  public static get(id: string): TableChatMessage | undefined {
    return this.tableChatMessages.get(id);
  }

  public static async create(props: Omit<TableChatMessageProps, "id">): Promise<TableChatMessage> {
    const tableChatMessage: TableChatMessage = new TableChatMessage({ id: createId(), ...props });
    this.tableChatMessages.set(tableChatMessage.id, tableChatMessage);
    PlayerManager.updateLastActiveAt(props.player.id);

    await publishRedisEvent(ServerInternalEvents.TABLE_MESSAGE_SEND, {
      tableId: props.tableId,
      chatMessage: tableChatMessage.toPlainObject(),
    });

    return tableChatMessage;
  }
}
