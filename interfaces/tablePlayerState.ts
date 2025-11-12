export enum TablePlayerAction {
  READY = "ready",
  PLAYING = "playing",
}

export interface TablePlayerStateUpdatePayload {
  tableId: string
  seatNumber?: number
  action: TablePlayerAction
}
