import { TableType } from "db";
import { FKey } from "@/constants/f-key-messages";

export interface TableChatMessageVariables {
  encryptedChar?: string
  decryptedChar?: string
  fKey?: FKey
  newRating?: number
  oldRating?: number
  heroCode?: string
  tableHostUsername?: string
  tableType?: TableType
  username?: string | null
}
