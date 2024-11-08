/**************************************************
 * Room
 **************************************************/

export const CHAT_MESSSAGE_MAX_LENGTH = 300

/**************************************************
 * Table
 **************************************************/

export const MAX_PLAYERS = 8

/**************************************************
 * Game
 **************************************************/

export const BOARD_ROWS = 15
export const BOARD_COLS = 6
export const HIDDEN_ROWS_COUNT = 2
export const PIECE_LENGTH = 3
export const PIECE_STARTING_ROW = 0
export const PIECE_STARTING_COL = 2
export const NUM_NEXT_PIECES = 10
export const MIN_MATCHING_BLOCKS = 3
export const HOO_SEQUENCE = "TOWERS"
export const NUM_BROKEN_BLOCKS_FOR_POWER = 4
export const POWER_BAR_LENGTH = 8
export const NUM_BROKEN_BLOCKS_FOR_SPEED_DROP = 50
export const NUM_BROKEN_BLOCKS_FOR_REMOVE_POWERS = 100
export const NUM_BROKEN_BLOCKS_FOR_REMOVE_STONES = 150
export const DIRECTIONS = [
  { row: -1, col: 0 }, // Up
  { row: 1, col: 0 }, // Down
  { row: 0, col: -1 }, // Left
  { row: 0, col: 1 }, // Right
  { row: -1, col: -1 }, // Top-left
  { row: -1, col: 1 }, // Top-right
  { row: 1, col: -1 }, // Bottom-left
  { row: 1, col: 1 }, // Bottom-right
]

/**************************************************
 * Game Ratings
 **************************************************/

export const RATING_MASTER = 2100 // 2100+
export const RATING_DIAMOND = 1800 // 1800 - 2099
export const RATING_PLATINUM = 1500 // 1500 - 1799
export const RATING_GOLD = 1200 // 1200 - 1499
export const RATING_SILVER = 0 // minimum - 1199
export const PROVISIONAL_MAX_COMPLETED_GAMES = 20
