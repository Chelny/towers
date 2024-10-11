import { BoardBlock } from "@/interfaces/game"

export const mockDefaultTowersBlockProps = {
  powerType: null,
  powerLevel: null,
  isToBeRemoved: false,
  brokenBlockNumber: null
}

export const mockBlockT: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "T" }
export const mockBlockO: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "O" }
export const mockBlockW: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "W" }
export const mockBlockE: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "E" }
export const mockBlockR: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "R" }
export const mockBlockS: BoardBlock = { ...mockDefaultTowersBlockProps, letter: "S" }
export const mockBlockMedusa: BoardBlock = { letter: "ME" }
export const mockBlockEmpty: BoardBlock = { letter: " " }
