import { EMPTY_CELL } from "@/constants/game";
import { Block, PieceBlock, PowerPieceBlock, SpecialDiamond } from "@/interfaces/towers";
import {
  isBoardBlock,
  isEmptyCell,
  isMedusaPieceBlock,
  isMidasPieceBlock,
  isPowerBarItem,
  isPowerPieceBlock,
  isSpecialDiamond,
  isTowersPieceBlock,
} from "@/utils/block-guards";

describe("isTowersPieceBlock", () => {
  it("should return true for towers block with valid letters", () => {
    const blocks: PieceBlock[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined, isToBeRemoved: false },
      { letter: "O", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined, isToBeRemoved: false },
      { letter: "W", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined, isToBeRemoved: false },
      { letter: "E", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined, isToBeRemoved: false },
      { letter: "R", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined, isToBeRemoved: false },
      { letter: "S", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined, isToBeRemoved: false },
    ];

    blocks.forEach((block: PieceBlock) => {
      expect(isTowersPieceBlock(block)).toBe(true);
    });
  });

  it("should return false for non-towers block", () => {
    const blocks: Block[] = [
      { letter: "ME", position: { row: 0, col: 0 } },
      { letter: "MI", position: { row: 0, col: 0 } },
      { letter: "SD", powerType: "speed drop" },
    ];

    blocks.forEach((block: Block) => {
      expect(isTowersPieceBlock(block)).toBe(false);
    });
  });
});

describe("isMedusaPieceBlock", () => {
  it("should return true for medusa block", () => {
    const block: PowerPieceBlock = { letter: "ME", position: { row: 0, col: 0 } };
    expect(isMedusaPieceBlock(block)).toBe(true);
  });

  it("should return false for non-medusa block", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined },
      { letter: "MI", position: { row: 0, col: 0 } },
      { letter: "SD", powerType: "speed drop" },
    ];

    blocks.forEach((block: Block) => {
      expect(isMedusaPieceBlock(block)).toBe(false);
    });
  });
});

describe("isMidasPieceBlock", () => {
  it("should return true for midas block", () => {
    const block: PowerPieceBlock = { letter: "MI", position: { row: 0, col: 0 } };
    expect(isMidasPieceBlock(block)).toBe(true);
  });

  it("should return false for non-midas block", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined },
      { letter: "ME", position: { row: 0, col: 0 } },
      { letter: "SD", powerType: "speed drop" },
    ];

    blocks.forEach((block: Block) => {
      expect(isMidasPieceBlock(block)).toBe(false);
    });
  });
});

describe("isSpecialDiamond", () => {
  it("should return true for special diamond", () => {
    const block: SpecialDiamond = { letter: "SD", powerType: "speed drop" };
    expect(isSpecialDiamond(block)).toBe(true);
  });

  it("should return false for non-special diamond", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined },
      { letter: "MI", position: { row: 0, col: 0 } },
      { letter: "ME", position: { row: 0, col: 0 } },
    ];

    blocks.forEach((block: Block) => {
      expect(isSpecialDiamond(block)).toBe(false);
    });
  });
});

describe("isBoardBlock", () => {
  it("should return true for board block", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined },
      { letter: "ME", position: { row: 0, col: 0 } },
      { letter: "MI", position: { row: 0, col: 0 } },
    ];

    blocks.forEach((block: Block) => {
      expect(isBoardBlock(block)).toBe(true);
    });
  });

  it("should return false for non-board block", () => {
    const blocks: Block[] = [{ letter: "SD", powerType: "speed drop" }];

    blocks.forEach((block: Block) => {
      expect(isBoardBlock(block)).toBe(false);
    });
  });
});

describe("isPowerPieceBlock", () => {
  it("should return true for power piece block", () => {
    const blocks: PowerPieceBlock[] = [
      { letter: "ME", position: { row: 0, col: 0 } },
      { letter: "MI", position: { row: 0, col: 0 } },
    ];

    blocks.forEach((block: PowerPieceBlock) => {
      expect(isPowerPieceBlock(block)).toBe(true);
    });
  });

  it("should return false for non-power piece block", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined },
      { letter: "SD", powerType: "speed drop" },
    ];

    blocks.forEach((block: Block) => {
      expect(isPowerPieceBlock(block)).toBe(false);
    });
  });
});

describe("isPowerBarItem", () => {
  it("should return true for power bar block with non-undefined powerType", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: "attack", powerLevel: "minor" },
      { letter: "SD", powerType: "speed drop" },
    ];

    blocks.forEach((block: Block) => {
      expect(isPowerBarItem(block)).toBe(true);
    });
  });

  it("should return false for non-power bar block", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined },
      { letter: "ME", position: { row: 0, col: 0 } },
    ];

    blocks.forEach((block: Block) => {
      expect(isPowerBarItem(block)).toBe(false);
    });
  });
});

describe("isEmptyCell", () => {
  it("should return true for empty cell", () => {
    const block: Block = EMPTY_CELL;
    expect(isEmptyCell(block)).toBe(true);
  });

  it("should return false for non-empty cell", () => {
    const blocks: Block[] = [
      { letter: "T", position: { row: 0, col: 0 }, powerType: undefined, powerLevel: undefined },
      { letter: "ME", position: { row: 0, col: 0 } },
      { letter: "MI", position: { row: 0, col: 0 } },
      { letter: "SD", powerType: "speed drop" },
    ];

    blocks.forEach((block: Block) => {
      expect(isEmptyCell(block)).toBe(false);
    });
  });
});
