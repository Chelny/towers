"use client";

import { Context, createContext, PropsWithChildren, ReactNode, useCallback, useContext, useState } from "react";

export type GameRoomSummary = {
  id: string
  name: string
  basePath: string
}

export type GameTableSummary = {
  id: string
  tableNumber: number
  roomId: string
  roomName: string
}

type GameContextType = {
  joinedRooms: GameRoomSummary[]
  addJoinedRoom: (room: GameRoomSummary) => void
  removeJoinedRoom: (roomId: string) => void

  activeRoomId: string | null
  setActiveRoomId: (id: string | null) => void

  joinedTables: GameTableSummary[]
  addJoinedTable: (table: GameTableSummary) => void
  removeJoinedTable: (tableId: string) => void

  activeTableId: string | null
  setActiveTableId: (id: string | null) => void
}

const GameContext: Context<GameContextType | undefined> = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: PropsWithChildren): ReactNode => {
  const [joinedRooms, setJoinedRooms] = useState<GameRoomSummary[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [joinedTables, setJoinedTables] = useState<GameTableSummary[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  /**************************************************
   * Room
   **************************************************/

  const addJoinedRoom = useCallback((room: GameRoomSummary) => {
    setJoinedRooms((prev: GameRoomSummary[]) =>
      prev.some((r: GameRoomSummary) => r.id === room.id) ? prev : [...prev, room],
    );
  }, []);

  const removeJoinedRoom = useCallback((roomId: string) => {
    setJoinedRooms((prev: GameRoomSummary[]) => prev.filter((r: GameRoomSummary) => r.id !== roomId));
    setJoinedTables((prev: GameTableSummary[]) => prev.filter((t: GameTableSummary) => t.roomId !== roomId));
  }, []);

  /**************************************************
   * Table
   **************************************************/

  const addJoinedTable = useCallback((table: GameTableSummary) => {
    setJoinedTables((prev: GameTableSummary[]) =>
      prev.some((t: GameTableSummary) => t.id === table.id) ? prev : [...prev, table],
    );
  }, []);

  const removeJoinedTable = useCallback((tableId: string) => {
    setJoinedTables((prev: GameTableSummary[]) => prev.filter((t: GameTableSummary) => t.id !== tableId));
  }, []);

  /**************************************************
   * Values
   **************************************************/

  const value: GameContextType = {
    joinedRooms,
    addJoinedRoom,
    removeJoinedRoom,

    activeRoomId,
    setActiveRoomId,

    joinedTables,
    addJoinedTable,
    removeJoinedTable,

    activeTableId,
    setActiveTableId,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context: GameContextType | undefined = useContext(GameContext);
  if (!context) throw new Error("useGameContext must be used within a GameProvider");
  return context;
};
