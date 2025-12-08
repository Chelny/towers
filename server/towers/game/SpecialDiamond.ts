export type SpecialDiamondLetter = "SD";
export type SpecialDiamondPowerType = "speed drop" | "remove powers" | "remove stones";

export interface SpecialDiamondPlainObject {
  letter: SpecialDiamondLetter
  powerType: SpecialDiamondPowerType
}

export class SpecialDiamond {
  public letter: SpecialDiamondLetter;
  public powerType: SpecialDiamondPowerType;

  constructor(powerType: SpecialDiamondPowerType) {
    this.letter = "SD";
    this.powerType = powerType;
  }

  public static fromPlainObject(obj: SpecialDiamondPlainObject): SpecialDiamond {
    const block: SpecialDiamond = new SpecialDiamond(obj.powerType);
    return block;
  }

  public toPlainObject(): SpecialDiamondPlainObject {
    return {
      letter: this.letter,
      powerType: this.powerType,
    };
  }
}
