import { EMPTY_CELL } from "@/constants/game"
import { BoardBlockPlainObject } from "@/server/towers/classes/Board"
import { PieceBlockPlainObject, PowerPieceBlockPlainObject } from "@/server/towers/classes/PieceBlock"
import { PowerBarPlainObject } from "@/server/towers/classes/PowerBar"
import { SpecialDiamondPlainObject } from "@/server/towers/classes/SpecialDiamond"
import { TowersPieceBlockPlainObject } from "@/server/towers/classes/TowersPieceBlock"

// Base Types
export type BlockLetter = "T" | "O" | "W" | "E" | "R" | "S" | "ME" | "MI" | "SD" | typeof EMPTY_CELL
export type TowersLetter = Exclude<BlockLetter, "ME" | "MI" | "SD" | typeof EMPTY_CELL>

// Power-related Types
export type PowerType = "attack" | "defense" | undefined
export type PowerLevel = "minor" | "normal" | "mega" | "berserk" | undefined
export type SpecialDiamondType = "speed drop" | "remove powers" | "remove stones"

// Core Block Types
export type BoardBlock = BoardBlockPlainObject
export type PieceBlock = PieceBlockPlainObject
export type TowersPieceBlock = TowersPieceBlockPlainObject
export type MedusaPieceBlock = PowerPieceBlockPlainObject
export type MidasPieceBlock = PowerPieceBlockPlainObject
export type PowerPieceBlock = PowerPieceBlockPlainObject
export type SpecialDiamond = SpecialDiamondPlainObject

// Combined Block Types
export type NextPieceBlock = PieceBlock | PowerPieceBlock
export type PowerBarItem = PieceBlock | SpecialDiamond
export type Block = PieceBlock | PowerPieceBlock | PowerBarItem | typeof EMPTY_CELL

// Structures
export type BoardRow = BoardBlock[]
export type Board = BoardRow[]
export type Piece = PieceBlock[]
export type NextPieces = NextPieceBlock[]
export type PowerBar = PowerBarItem[]
export type Powers = { [key in TowersLetter]: PowerBarPlainObject }
