import type { BoardBlock } from "@/server/towers/classes/Board"
import { EMPTY_CELL } from "@/constants/game"
import { MedusaPiece } from "@/server/towers/classes/MedusaPiece"
import { MedusaPieceBlock } from "@/server/towers/classes/MedusaPieceBlock"
import { MidasPiece } from "@/server/towers/classes/MidasPiece"
import { MidasPieceBlock } from "@/server/towers/classes/MidasPieceBlock"
import { Piece } from "@/server/towers/classes/Piece"
import { PieceBlock } from "@/server/towers/classes/PieceBlock"
import { PowerBarItem } from "@/server/towers/classes/PowerBar"
import { SpecialDiamond } from "@/server/towers/classes/SpecialDiamond"
import { TowersPieceBlock } from "@/server/towers/classes/TowersPieceBlock"

export type Block = TowersPieceBlock | MedusaPieceBlock | MidasPieceBlock | SpecialDiamond | typeof EMPTY_CELL

export const isBoardBlock = (block: Block): block is BoardBlock => {
  return isTowersPieceBlock(block) || isPowerPieceBlock(block)
}

export const isPieceBlock = (block: Block): block is PieceBlock => {
  return block instanceof PieceBlock
}

export const isTowersPieceBlock = (block: Block): block is TowersPieceBlock => {
  return block instanceof TowersPieceBlock
}

export const isMedusaPiece = (piece: Piece): piece is MedusaPiece => {
  return piece instanceof MedusaPiece
}

export const isMedusaPieceBlock = (block: Block): block is MedusaPieceBlock => {
  return block instanceof MedusaPieceBlock
}

export const isMidasPiece = (piece: Piece): piece is MidasPiece => {
  return piece instanceof MidasPiece
}

export const isMidasPieceBlock = (block: Block): block is MidasPieceBlock => {
  return block instanceof MidasPieceBlock
}

export const isPowerPieceBlock = (block: Block): block is PieceBlock => {
  return isMedusaPieceBlock(block) || isMidasPieceBlock(block)
}

export const isSpecialDiamond = (block: Block): block is SpecialDiamond => {
  return block instanceof SpecialDiamond
}

export const isPowerBarItem = (block: Block): block is PowerBarItem => {
  return (
    (isTowersPieceBlock(block) && typeof block.powerType !== "undefined" && typeof block.powerLevel !== "undefined") ||
    isSpecialDiamond(block)
  )
}

export const isEmptyCell = (block: Block): block is typeof EMPTY_CELL => {
  return block === EMPTY_CELL
}
