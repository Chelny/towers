import { TableType } from "db";

export const mockJoinedTables1 = {
  "mock-table-1": {
    id: "mock-table-1",
    roomId: "mock-room-1",
    tableNumber: 1,
    tableType: TableType.PUBLIC,
    seatNumber: 1,
    teamNumber: 1,
    isReady: false,
    isPlaying: false,
    createdAt: Date.now(),
  },
  "mock-table-3": {
    id: "mock-table-3",
    roomId: "mock-room-1",
    tableNumber: 3,
    tableType: TableType.PROTECTED,
    seatNumber: undefined,
    teamNumber: undefined,
    isReady: false,
    isPlaying: false,
    createdAt: Date.now(),
  },
};

export const mockLastJoinedTable1 = {
  id: "mock-table-1",
  roomId: "mock-room-1",
  tableNumber: 1,
  tableType: TableType.PUBLIC,
  seatNumber: 1,
  teamNumber: 1,
  isReady: false,
  isPlaying: false,
  createdAt: Date.now(),
};

export const mockJoinedTables2 = {
  "mock-table-1": {
    id: "mock-table-1",
    roomId: "mock-room-1",
    tableNumber: 1,
    tableType: TableType.PUBLIC,
    seatNumber: 2,
    teamNumber: 1,
    isReady: true,
    isPlaying: false,
    createdAt: Date.now(),
  },
};

export const mockLastJoinedTable2 = {
  id: "mock-table-1",
  roomId: "mock-room-1",
  tableNumber: 1,
  tableType: TableType.PUBLIC,
  seatNumber: 2,
  teamNumber: 1,
  isReady: true,
  isPlaying: false,
  createdAt: Date.now(),
};

export const mockJoinedTables3 = {
  "mock-table-1": {
    id: "mock-table-1",
    roomId: "mock-room-1",
    tableNumber: 1,
    tableType: TableType.PUBLIC,
    seatNumber: 7,
    teamNumber: 4,
    isReady: false,
    isPlaying: false,
    createdAt: Date.now(),
  },
};

export const mockLastJoinedTable3 = {
  id: "mock-table-1",
  roomId: "mock-room-1",
  tableNumber: 1,
  tableType: TableType.PUBLIC,
  seatNumber: 7,
  teamNumber: 4,
  isReady: false,
  isPlaying: false,
  createdAt: Date.now(),
};
