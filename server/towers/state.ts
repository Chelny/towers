import { Game } from "@/server/towers/models/Game";
import { Player } from "@/server/towers/models/Player";
import { PlayerStats } from "@/server/towers/models/PlayerStats";
import { Table } from "@/server/towers/models/Table";
import { TableSeat } from "@/server/towers/models/TableSeat";

export const players: Map<string, Player> = new Map<string, Player>();
export const playerStats: Map<string, PlayerStats> = new Map<string, PlayerStats>();
export const tables: Map<string, Table> = new Map<string, Table>();
export const tableSeats: Map<string, TableSeat> = new Map<string, TableSeat>();
export const games: Map<string, Game> = new Map<string, Game>();
