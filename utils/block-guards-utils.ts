import {
  Block,
  BoardBlock,
  EmptyCell,
  MedusaBlock,
  MidasBlock,
  PowerBarBlock,
  PowerPieceBlock,
  SpecialDiamond,
  TowersBlock,
} from "@/interfaces/game"

export const isTowersBlock = (block: Block): block is TowersBlock => {
  return ["T", "O", "W", "E", "R", "S"].includes(block.letter)
}

export const isMedusaBlock = (block: Block): block is MedusaBlock => {
  return block.letter === "ME"
}

export const isMidasBlock = (block: Block): block is MidasBlock => {
  return block.letter === "MI"
}

export const isSpecialDiamond = (block: Block): block is SpecialDiamond => {
  return block.letter === "SD"
}

export const isBoardBlock = (block: Block): block is BoardBlock => {
  return isTowersBlock(block) || isMedusaBlock(block) || isMidasBlock(block)
}

export const isPowerPieceBlock = (block: Block): block is PowerPieceBlock => {
  return isMedusaBlock(block) || isMidasBlock(block)
}

export const isPowerBarBlock = (block: Block): block is PowerBarBlock => {
  return block.powerType !== null && (isTowersBlock(block) || isSpecialDiamond(block))
}

export const isEmptyCell = (block: Block): block is EmptyCell => {
  return block.letter === " "
}
