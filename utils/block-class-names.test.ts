import { EMPTY_CELL } from "@/constants/game";
import { PieceBlock, PowerPieceBlock, PowerType } from "@/interfaces/towers";
import {
  getBlockRemovalAnimationClass,
  getClassNameForBlock,
  getClassNameForBlockPowerType,
} from "@/utils/block-class-names";

const defaultTowersBlockProps = {
  position: { row: 0, col: 0 },
  powerType: undefined,
  powerLevel: undefined,
  isToBeRemoved: false,
};

describe("getClassNameForBlock", () => {
  it("should return the correct class name for Towers block types", () => {
    const towersBlocks: PieceBlock[] = [
      { ...defaultTowersBlockProps, letter: "Y" },
      { ...defaultTowersBlockProps, letter: "O" },
      { ...defaultTowersBlockProps, letter: "U" },
      { ...defaultTowersBlockProps, letter: "P" },
      { ...defaultTowersBlockProps, letter: "I" },
      { ...defaultTowersBlockProps, letter: "!" },
    ];
    const expectedClasses: string[] = ["block-y", "block-o", "block-u", "block-p", "block-i", "block-x"];

    towersBlocks.forEach((block: PieceBlock, index: number) => {
      expect(getClassNameForBlock(block)).toBe(expectedClasses[index]);
    });
  });

  it("should return the correct class name for Medusa block", () => {
    const medusaBlock: PowerPieceBlock = { letter: "ME", position: { row: 0, col: 0 } };

    expect(getClassNameForBlock(medusaBlock)).toBe("block-medusa");
  });

  it("should return the correct class name for Midas block", () => {
    const midasBlock: PowerPieceBlock = { letter: "MI", position: { row: 0, col: 0 } };

    expect(getClassNameForBlock(midasBlock)).toBe("block-midas");
  });
});

describe("getClassNameForBlockPowerType", () => {
  it("should return the correct class name for attack power type", () => {
    const attackBlock: PieceBlock = {
      ...defaultTowersBlockProps,
      letter: "Y",
      powerType: "attack",
      powerLevel: "minor",
    };

    expect(getClassNameForBlockPowerType(attackBlock)).toBe("attack-block");
  });

  it("should return the correct class name for defense power type", () => {
    const defenseBlock: PieceBlock = {
      ...defaultTowersBlockProps,
      letter: "Y",
      powerType: "defense",
      powerLevel: "minor",
    };

    expect(getClassNameForBlockPowerType(defenseBlock)).toBe("defense-block");
  });

  it("should return an empty string for unknown power types", () => {
    const unknownPowerTypeBlock: PieceBlock = {
      ...defaultTowersBlockProps,
      letter: "Y",
      powerType: "test" as PowerType,
    };

    expect(getClassNameForBlockPowerType(unknownPowerTypeBlock)).toBe("");
  });
});

describe("getBlockRemovalAnimationClass", () => {
  it("should return an empty string if block is not a piece block", () => {
    const emptyCell: typeof EMPTY_CELL = EMPTY_CELL;
    expect(getBlockRemovalAnimationClass(emptyCell)).toBe("");
  });

  it("should return an empty string if block is not marked to be removed", () => {
    const towersBlock: PieceBlock = {
      ...defaultTowersBlockProps,
      letter: "Y",
    };
    expect(getBlockRemovalAnimationClass(towersBlock)).toBe("");
  });

  it("should return \"block-break\" if no origin is provided", () => {
    const towersBlock: PieceBlock = {
      ...defaultTowersBlockProps,
      letter: "Y",
      isToBeRemoved: true,
    };
    expect(getBlockRemovalAnimationClass(towersBlock)).toBe("block-break");
  });

  const directionCases = [
    { pos: [0, 0], origin: [-1, 0], expected: "block-explode-down" },
    { pos: [0, 0], origin: [1, 0], expected: "block-explode-up" },
    { pos: [0, 0], origin: [0, -1], expected: "block-explode-right" },
    { pos: [0, 0], origin: [0, 1], expected: "block-explode-left" },
    { pos: [0, 0], origin: [-1, -1], expected: "block-explode-down-right" },
    { pos: [0, 0], origin: [-1, 1], expected: "block-explode-down-left" },
    { pos: [0, 0], origin: [1, -1], expected: "block-explode-up-right" },
    { pos: [0, 0], origin: [1, 1], expected: "block-explode-up-left" },
  ];

  const makeBlock = (
    row: number,
    col: number,
    isToBeRemoved = false,
    removedByOrigin?: { row: number; col: number },
  ): PieceBlock => ({
    letter: "Y",
    position: { row, col },
    powerType: undefined,
    powerLevel: undefined,
    isToBeRemoved,
    removedByOrigin,
  });

  directionCases.forEach(({ pos, origin, expected }) => {
    it(`should return "${expected}" for origin at [${origin}]`, () => {
      const block: PieceBlock = makeBlock(pos[0], pos[1], true, {
        row: origin[0],
        col: origin[1],
      });

      expect(getBlockRemovalAnimationClass(block)).toBe(expected);
    });
  });
});
