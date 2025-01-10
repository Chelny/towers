// import { BOARD_COLS, BOARD_ROWS, DIRECTIONS, HOO_SEQUENCE, MIN_MATCHING_BLOCKS, NUM_NEXT_PIECES, PIECE_LENGTH } from "@/constants/game"
// import { TickSpeed } from "@/enums/tick-speed"
// import { createEmptyCell, createMedusaBlock, createPieceBlock, isInBounds } from "@/hooks/useTowersBoard"
// import {
//   Block,
//   BlockPosition,
//   Board,
//   BoardBlock,
//   BoardCellPosition,
//   MarkBlocksForDeletion,
//   Piece,
//   PowerBarBlock,
//   PowerBlock,
//   Powers,
//   TowersLetter,
// } from "@/interfaces/game"
// import {
//   isEmptyCell,
//   isMedusaBlock,
//   isMidasBlock,
//   isPowerBarBlock,
//   isSpecialDiamond,
//   isTowersBlock,
// } from "@/utils/block-guards-utils"

// /**
//  * Applies the effect of a special piece to the game board. This includes converting adjacent blocks
//  * to a specified type and removing the special piece from the board.
//  *
//  * @param board - The current game board represented as a 2D array of BoardCell.
//  * @param row - The row position where the special piece has landed.
//  * @param col - The column position where the special piece has landed.
//  * @param createBlock - A function that creates the type of block to replace adjacent blocks with.
//  * @param excludeCondition - A function that checks if a block should be excluded from conversion.
//  */
// const applyPowerPieceToBoard = (
//   board: Board,
//   row: number,
//   col: number,
//   createBlock: () => BoardBlock,
//   excludeCondition: (block: BoardBlock) => boolean,
// ): void => {
//   // Convert adjacent blocks based on the special piece’s effect
//   for (let i = 0; i < PIECE_LENGTH; i++) {
//     const pieceRow: number = row + i
//     const pieceCol: number = col

//     for (const dir of DIRECTIONS) {
//       const adjRow: number = pieceRow + dir.row
//       const adjCol: number = pieceCol + dir.col

//       if (isInBounds(adjRow, adjCol)) {
//         const block: Block = board[adjRow][adjCol]

//         if (isTowersBlock(block) && !excludeCondition(block)) {
//           // Convert the adjacent block
//           board[adjRow][adjCol] = createBlock()
//         }
//       }
//     }
//   }

//   // Remove the special piece from the board
//   for (let i = 0; i < PIECE_LENGTH; i++) {
//     const pieceRow: number = row + i
//     const pieceCol: number = col

//     if (isInBounds(pieceRow, pieceCol)) {
//       board[pieceRow][pieceCol] = createEmptyCell()
//     }
//   }
// }

// /**
//  * Sends a flashing three-piece of stones to your opponent.
//  * Any adjacent pieces that it touches when it comes to rest turn into stones.
//  *
//  * @param board - The current game board represented as a 2D array of BoardCell.
//  * @param row - The row position where the Medusa piece has landed.
//  * @param col - The column position where the Medusa piece has landed.
//  */
// const applyMedusaToBoard = (board: Board, row: number, col: number): void => {
//   applyPowerPieceToBoard(board, row, col, createMedusaBlock, (cell: Block) => isMedusaBlock(cell))
// }

// /**
//  * A half orange, half yellow three-piece twizzler falls. Any adjacent blocks it when it comes to rest turn yellow.
//  * Stones are not affected. Yellow pieces formed are not sent during hoo attacks.
//  *
//  * @param board - The current game board represented as a 2D array of BoardCell.
//  * @param row - The row position where the Midas piece has landed.
//  * @param col - The column position where the Midas piece has landed.
//  */
// const applyMidasToBoard = (board: Board, row: number, col: number): void => {
//   applyPowerPieceToBoard(
//     board,
//     row,
//     col,
//     () => createPieceBlock("R"),
//     (cell: Block) => isMedusaBlock(cell),
//   )
// }

// /**
//  * Marks and clears blocks on the board that match the deletion criteria.
//  * This function identifies blocks for deletion based on matching criteria
//  * and T-O-W-E-R-S sequences. After marking blocks, it slides remaining blocks
//  * down and updates the board state accordingly. Recursively calls itself to
//  * handle new matches after sliding blocks.
//  *
//  * @param board - The current game board.
//  * @param powers - The current state of the powers.
//  * @returns An object containing the positions of blocks to delete and the updated state of the powers.
//  */
// const markBlocksForDeletion = useCallback(
//   (board: Board, powers: Powers): MarkBlocksForDeletion => {
//     const directions: BoardCellPosition[] = [
//       { dx: 1, dy: 0 },
//       { dx: 0, dy: 1 },
//       { dx: 1, dy: 1 },
//       { dx: 1, dy: -1 },
//     ]
//     const blocksToDelete: BlockPosition[] = []

//     for (let row = 0; row < BOARD_ROWS; row++) {
//       for (let col = 0; col < BOARD_COLS; col++) {
//         if (isTowersBlock(board[row][col])) {
//           directions.forEach(({ dx, dy }: BoardCellPosition) => {
//             checkDirection(board, row, col, dx, dy, blocksToDelete)
//           })
//         }
//       }
//     }

//     blocksToDelete.forEach(({ row, col }: BlockPosition, index: number) => {
//       if (isPowerBarBlock(board[row][col])) {
//         const newPowerBarBlock: PowerBarBlock = board[row][col] as PowerBarBlock
//         dispatchBoardState({ type: "addToPowerBar", newAddedPowerBlock: newPowerBarBlock })
//       }

//       if (isTowersBlock(board[row][col])) {
//         const blockLetter: TowersLetter = board[row][col].letter as TowersLetter

//         if (powers[blockLetter]) {
//           powers = {
//             ...powers,
//             [blockLetter]: {
//               ...powers[blockLetter],
//               numBrokenBlocks: powers[blockLetter].numBrokenBlocks + 1,
//             },
//           }
//         }

//         board[row][col] = {
//           ...board[row][col],
//           isToBeRemoved: true,
//           brokenBlockNumber: isHooDetected ? index + 1 : null,
//         }

//         setTimeout(() => {
//           board[row][col] = createEmptyCell()
//         }, TickSpeed.BREAKING_BLOCKS)

//         setTotalBrokenBlocks((prevTotalBrokenBlocks: number) => prevTotalBrokenBlocks + 1)
//         setScore((prevTotalBrokenBlocks: number) => prevTotalBrokenBlocks + 1)
//       }
//     })

//     return { updatedPowers: powers, blocksToDelete }
//   },
//   [isHooDetected],
// )

// /**
//  * Checks the game board in a specific direction from a given starting position
//  * to identify and mark blocks for deletion. It looks for two types of sequences:
//  * matching blocks of the same color and the specific T-O-W-E-R-S sequence.
//  *
//  * @param board - The current game board.
//  * @param row - The starting row position for checking.
//  * @param col - The starting column position for checking.
//  * @param dx - The change in the x (column) direction.
//  * @param dy - The change in the y (row) direction.
//  * @param blocksToDelete - An array to store positions of blocks that need to be deleted.
//  */
// const checkDirection = (
//   board: Board,
//   row: number,
//   col: number,
//   dx: number,
//   dy: number,
//   blocksToDelete: BlockPosition[],
// ): void => {
//   const match: BlockPosition[] = []
//   let r: number = row
//   let c: number = col
//   let sequence: string = ""

//   const deleteBlocks = (blockPosition: BlockPosition[]): void => {
//     blockPosition.forEach(({ row, col }: BlockPosition) => {
//       blocksToDelete.push({ row, col })
//     })
//   }

//   // Check for matching blocks in the current direction
//   while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS && board[r][c].letter === board[row][col].letter) {
//     match.push({ row: r, col: c })
//     r += dy
//     c += dx
//   }

//   // If there are at least 3 matching blocks, mark them for deletion
//   if (match.length >= MIN_MATCHING_BLOCKS) deleteBlocks(match)

//   // Check for matching T-O-W-E-R-S sequence
//   r = row
//   c = col
//   let matchedSequence: BlockPosition[] = []

//   while (
//     r >= 0 &&
//     r < BOARD_ROWS &&
//     c >= 0 &&
//     c < BOARD_COLS &&
//     sequence.length < HOO_SEQUENCE.length &&
//     board[r][c].letter === HOO_SEQUENCE.charAt(sequence.length)
//   ) {
//     sequence += board[r][c].letter
//     matchedSequence.push({ row: r, col: c })
//     r += dy
//     c += dx
//   }

//   if (sequence === HOO_SEQUENCE) {
//     let numFallsPerHoo: number = 0

//     if ((dx === 1 && dy === 1) || (dx === 1 && dy === -1)) {
//       numFallsPerHoo = 2 // Diagonal hoo
//     } else if (dx === 0 && dy === 1) {
//       numFallsPerHoo = 3 // Vertical hoo
//     } else {
//       numFallsPerHoo = 1 // Horizontal hoo
//     }

//     setNumHoos((prevNumHoos: number) => {
//       const newNumHoos: number = prevNumHoos + 1
//       const totalFalls: number = newNumHoos - 1 + numFallsPerHoo

//       // Handle rainbow hoo detection
//       if (isHooDetected) {
//         deleteBlocks(matchedSequence)
//         setIsHooDetected(false)
//       } else {
//         // Regular hoo detected
//         setIsHooDetected(true)
//       }

//       setNumFalls((prevNumFalls: number) => prevNumFalls + totalFalls)

//       return newNumHoos
//     })

//     // Add matched blocks to blocksToDelete array for regular hoo
//     if (!isHooDetected) deleteBlocks(matchedSequence)
//   }
// }

// /**
//  * Clears empty cells and slides remaining blocks down to fill gaps on the board.
//  * This function scans the board column by column from bottom to top, shifting blocks
//  * down to fill any empty cells below them.
//  *
//  * @param board - The current game board.
//  * @returns The updated game board with blocks slid down to fill empty cells.
//  */
// const clearAndSlideBlocks = (board: Board): Board => {
//   for (let col = 0; col < BOARD_COLS; col++) {
//     for (let row = BOARD_ROWS - 1; row >= 0; row--) {
//       if (isEmptyCell(board[row][col])) {
//         let newRow: number = row

//         while (newRow >= 0 && isEmptyCell(board[newRow][col])) {
//           newRow--
//         }

//         if (newRow >= 0) {
//           board[row][col] = board[newRow][col]
//           board[newRow][col] = createEmptyCell()
//         }
//       }
//     }
//   }

//   return board
// }

// /**
//  * Adds a dropping piece to the game board at a specified position.
//  *
//  * @param board - The game board to add the piece to.
//  * @param droppingPiece - The piece being dropped onto the board.
//  * @param droppingRow - The row position where the piece is being dropped.
//  * @param droppingColumn - The column position where the piece is being dropped.
//  */
// function addPieceToBoard(board: Board, droppingPiece: Piece, droppingRow: number, droppingColumn: number): void {
//   droppingPiece.forEach((block: BoardBlock, rowIndex: number) => {
//     board[droppingRow + rowIndex][droppingColumn] = block
//   })
// }
