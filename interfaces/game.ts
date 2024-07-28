export interface BlockBase {
  letter: BlockLetter
  powerType?: PowerType
  powerLevel?: PowerLevel
  specialDiamondType?: SpecialDiamondType
  isToBeRemoved?: boolean
  brokenBlockNumber?: number | null
}

export interface TowersBlock extends BlockBase {
  letter: TowersLetter
  powerType: PowerType
  powerLevel: PowerLevel
  isToBeRemoved: boolean
  brokenBlockNumber: number | null
}

export interface MedusaBlock extends BlockBase {
  letter: "ME"
}

export interface MidasBlock extends BlockBase {
  letter: "MI"
}

export interface SpecialDiamond extends BlockBase {
  letter: "SD"
  specialDiamondType: SpecialDiamondType
}

export interface EmptyCell extends BlockBase {
  letter: " "
}

export interface BlockPosition {
  row: number
  col: number
}

export interface BoardCellPosition {
  dx: number
  dy: number
}

export interface PowerBlock {
  numBrokenBlocks: number
  powerType: PowerType
  powerLevel: PowerLevel
  isPowerToBeApplied: boolean
}

export interface MarkBlocksForDeletion {
  updatedPowers: Powers
  blocksToDelete: BlockPosition[]
}

export type BlockLetter = "T" | "O" | "W" | "E" | "R" | "S" | "ME" | "MI" | "SD" | " "
export type TowersLetter = Exclude<BlockLetter, "ME" | "MI" | "SD" | " ">
export type PowerType = "attack" | "defense" | null
export type PowerLevel = "minor" | "normal" | "mega" | null
export type SpecialDiamondType = "speed drop" | "remove powers" | "remove stones"
export type Block = TowersBlock | MedusaBlock | MidasBlock | SpecialDiamond | EmptyCell
export type BoardBlock = Exclude<Block, SpecialDiamond>
export type PowerPieceBlock = Extract<Block, MedusaBlock | MidasBlock>
export type PowerBarBlock = Extract<Block, TowersBlock | SpecialDiamond>
export type Piece = BoardBlock[]
export type BoardRow = BoardBlock[]
export type Board = BoardRow[]
export type Powers = { [key in TowersLetter]: PowerBlock }

/**
 * Represents the state of the game board and current dropping piece.
 */
export type BoardState = {
  board: Board // The current state of the game board.
  droppingPiece: Piece // The piece currently dropping onto the board.
  droppingRow: number // The current row position of the dropping piece.
  droppingColumn: number // The current column position of the dropping piece.
  powerBar: PowerBarBlock[] // The current state of the power bar.
  usedPowerBlock: PowerBarBlock | null // The power bar block.
}

/**
 * Defines actions that can be dispatched to modify the board state.
 */
export type BoardAction = {
  // Action type to indicate different board operations.
  type:
    | "start"
    | "drop"
    | "move"
    | "commit"
    | "addToPowerBar"
    | "useItemFromPowerBar"
    | "addRow"
    | "removeRow"
    | "dither"
    | "clump"
    | "addStones"
    | "dropStones"
    | "defuse"
    | "colorBlast"
    | "removePowers"
    | "colorPlague"
    | "specialSpeedDrop"
    | "specialRemovePowers"
    | "specialRemoveStones"
  newBoard?: Board // New board configuration after a commit action.
  newPiece?: Piece // New piece configuration after a commit action.
  isPressingLeft?: boolean // Flag indicating left arrow key press for movement action.
  isPressingRight?: boolean // Flag indicating right arrow key press for movement action.
  isRotating?: boolean // Flag indicating rotation action.
  powerLevel?: PowerLevel // Indicates the intensity of the board action: "minor", "normal", or "mega".
  newPowerBar?: PowerBarBlock[] // New power bar configuration.
  newAddedPowerBlock?: PowerBarBlock // Added power bar block.
  newRemovedPowerBlock?: PowerBarBlock // Added power bar block.
}
