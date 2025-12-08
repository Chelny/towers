import { EMPTY_CELL } from "@/constants/game";
import { BoardBlock } from "@/interfaces/towers";

export const mockDefaultBlockProps = {
  position: { row: 0, col: 0 },
  powerType: null,
  powerLevel: null,
  isToBeRemoved: false,
};

export const mockBlockT: BoardBlock = { ...mockDefaultBlockProps, letter: "T" };
export const mockBlockO: BoardBlock = { ...mockDefaultBlockProps, letter: "O" };
export const mockBlockW: BoardBlock = { ...mockDefaultBlockProps, letter: "W" };
export const mockBlockE: BoardBlock = { ...mockDefaultBlockProps, letter: "E" };
export const mockBlockR: BoardBlock = { ...mockDefaultBlockProps, letter: "R" };
export const mockBlockS: BoardBlock = { ...mockDefaultBlockProps, letter: "S" };
export const mockBlockMedusa: BoardBlock = { ...mockDefaultBlockProps, letter: "ME" };
export const mockBlockEmpty: BoardBlock = EMPTY_CELL;
