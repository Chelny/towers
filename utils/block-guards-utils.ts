import { EMPTY_CELL } from "@/constants/game"
import {
  Block,
  BoardBlock,
  MedusaPieceBlock,
  MidasPieceBlock,
  PieceBlock,
  PowerBarItem,
  PowerPieceBlock,
  SpecialDiamond,
  TowersPieceBlock,
} from "@/interfaces/towers"

export const isBoardBlock = (block: Block): block is BoardBlock => {
  return isTowersPieceBlock(block) || isPowerPieceBlock(block)
}

export const isPieceBlock = (block: Block): block is PieceBlock => {
  return block === " " || "letter" in block
}

export const isTowersPieceBlock = (block: Block): block is TowersPieceBlock => {
  return !isEmptyCell(block) && ["T", "O", "W", "E", "R", "S"].includes(block.letter)
}

export const isMedusaPieceBlock = (block: Block): block is MedusaPieceBlock => {
  return !isEmptyCell(block) && block.letter === "ME"
}

export const isMidasPieceBlock = (block: Block): block is MidasPieceBlock => {
  return !isEmptyCell(block) && block.letter === "MI"
}

export const isPowerPieceBlock = (block: Block): block is PowerPieceBlock => {
  return isMedusaPieceBlock(block) || isMidasPieceBlock(block)
}

export const isSpecialDiamond = (block: Block): block is SpecialDiamond => {
  return !isEmptyCell(block) && block.letter === "SD"
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
