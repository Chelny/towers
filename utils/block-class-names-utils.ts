import { Block } from "@/interfaces/towers";
import {
  isMedusaPieceBlock,
  isMidasPieceBlock,
  isPieceBlock,
  isPowerBarItem,
  isTowersPieceBlock,
} from "@/utils/block-guards-utils";

/**
 * Returns the CSS class name corresponding to a given block type for styling purposes.
 *
 * @param block - Block type identifier.
 * @returns CSS class name associated with the block type.
 */
export const getClassNameForBlock = (block: Block): string => {
  if (isTowersPieceBlock(block)) {
    switch (block.letter) {
      case "T":
        return "block-t";
      case "O":
        return "block-o";
      case "W":
        return "block-w";
      case "E":
        return "block-e";
      case "R":
        return "block-r";
      case "S":
        return "block-s";
    }
  } else if (isMedusaPieceBlock(block)) {
    return "block-medusa";
  } else if (isMidasPieceBlock(block)) {
    return "block-midas";
  }

  return "";
};

/**
 * Returns the CSS class name corresponding to a given block power type for styling purposes.
 *
 * @param block - Block type identifier.
 * @returns CSS class name associated with the block power type.
 */
export const getClassNameForBlockPowerType = (block: Block): string => {
  if (isPowerBarItem(block)) {
    switch (block.powerType) {
      case "attack":
        return "attack-block";
      case "defense":
        return "defense-block";
    }
  }

  return "";
};

/**
 * Returns the CSS class name corresponding to a block animation for styling purposes.
 *
 * @param block - Block type identifier.
 * @returns CSS class name associated with the animation name.
 */
export const getBlockRemovalAnimationClass = (block: Block): string => {
  if (isPieceBlock(block)) {
    if (block.isToBeRemoved) {
      if (block.removedByOrigin) {
        const dx: number = block.position.col - block.removedByOrigin.col;
        const dy: number = block.position.row - block.removedByOrigin.row;
        const directions = ["up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right"];

        const dir: string =
          dy === -1 && dx === 0
            ? "up"
            : dy === 1 && dx === 0
              ? "down"
              : dy === 0 && dx === -1
                ? "left"
                : dy === 0 && dx === 1
                  ? "right"
                  : dy === -1 && dx === -1
                    ? "up-left"
                    : dy === -1 && dx === 1
                      ? "up-right"
                      : dy === 1 && dx === -1
                        ? "down-left"
                        : dy === 1 && dx === 1
                          ? "down-right"
                          : directions[Math.floor(Math.random() * directions.length)];

        return `block-explode-${dir}`;
      }

      return "block-break";
    }
  }

  return "";
};
