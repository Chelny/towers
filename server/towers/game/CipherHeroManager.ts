export interface CipherKey {
  encryptedChar: string // Original character to be encrypted
  decryptedChar: string // Cipher character that replaces the original
}

/**
 * Manages cipher keys awarded to users, and provides decryption functionality.
 * Each user has a collection of one-way cipher keys.
 */
export class CipherHeroManager {
  private static readonly CIPHER_MAP: Record<string, string> = {
    A: "P",
    B: "6",
    C: "N",
    D: "X",
    E: "F",
    F: "E",
    G: "Z",
    H: "B",
    I: "G",
    J: "1",
    K: "L",
    L: "8",
    M: "U",
    N: "K",
    O: "R",
    P: "I",
    Q: "3",
    R: "W",
    S: "V",
    T: "9",
    U: "0",
    V: "M",
    W: "C",
    X: "4",
    Y: "5",
    Z: "7",
    "1": "O",
    "2": "T",
    "3": "D",
    "4": "Q",
    "5": "2",
    "6": "J",
    "7": "A",
    "8": "S",
    "9": "Y",
    "0": "H",
    " ": " ",
  };
  private static userCipherKeys: Map<string, CipherKey[]> = new Map<string, CipherKey[]>();
  private static heroCodes: Map<string, string> = new Map<string, string>();

  /**
   * Awards a random cipher key to the specified user.
   *
   * @param playerId - The unique ID of the user receiving the key.
   * @returns The generated cipher key.
   */
  public static getCipherKey(playerId: string): CipherKey | null {
    const allKeys: [string, string][] = Object.entries(CipherHeroManager.CIPHER_MAP);
    const existingKeys: Set<string> = new Set(
      CipherHeroManager.getUserCipherKeys(playerId).map((k: CipherKey) => k.encryptedChar),
    );
    const availableKeys: [string, string][] = allKeys.filter(([encryptedChar]) => !existingKeys.has(encryptedChar));

    if (availableKeys.length === 0) return null;

    const [encryptedChar, decryptedChar]: [string, string] =
      availableKeys[Math.floor(Math.random() * availableKeys.length)];
    const key: CipherKey = { encryptedChar, decryptedChar };

    const keys: CipherKey[] = CipherHeroManager.userCipherKeys.get(playerId) ?? [];
    keys.push(key);
    CipherHeroManager.userCipherKeys.set(playerId, keys);

    return key;
  }

  /**
   * Retrieves all cipher keys generated to a specific user.
   *
   * @param playerId - The ID of the user.
   * @returns A list of `CipherKey` objects.
   */
  private static getUserCipherKeys(playerId: string): CipherKey[] {
    return CipherHeroManager.userCipherKeys.get(playerId) ?? [];
  }

  /**
   * Generates a readable random code phrase using natural English sentence structure.
   * The phrase follows one of two formats:
   * - With digit:    "The 3 brave dragons fly boldly."
   * - Without digit: "Brave knight climbs swiftly."
   *
   * @param playerId - The ID of the user.
   * @returns - The generated phrase in sentence case.
   */
  public static generateHeroCode(playerId: string): string {
    const adjectives: string[] = [
      "amazing",
      "brave",
      "calm",
      "daring",
      "eager",
      "fierce",
      "gentle",
      "happy",
      "icy",
      "jolly",
      "kind",
      "lucky",
      "mighty",
      "noisy",
      "odd",
      "proud",
      "quick",
      "rare",
      "silent",
      "tough",
      "unique",
      "vivid",
      "wild",
      "xenial",
      "young",
      "zany",
    ];
    const nounsSingular: string[] = [
      "apple",
      "beast",
      "cat",
      "dragon",
      "eagle",
      "fox",
      "goat",
      "hero",
      "igloo",
      "jewel",
      "knight",
      "lion",
      "moon",
      "ninja",
      "owl",
      "panda",
      "queen",
      "robot",
      "star",
      "tower",
      "unicorn",
      "viking",
      "wizard",
      "yeti",
      "zebra",
    ];
    const verbs: string[] = [
      "attacks",
      "blocks",
      "climbs",
      "dives",
      "eats",
      "flies",
      "grows",
      "hides",
      "ignites",
      "jumps",
      "kicks",
      "leaps",
      "moves",
      "nests",
      "opens",
      "punches",
      "quakes",
      "runs",
      "shouts",
      "twirls",
      "unleashes",
      "vanishes",
      "wins",
      "explodes",
      "yells",
      "zips",
    ];
    const adverbs: string[] = [
      "abruptly",
      "boldly",
      "calmly",
      "deeply",
      "eagerly",
      "fast",
      "greatly",
      "happily",
      "intensely",
      "jokingly",
      "keenly",
      "loudly",
      "madly",
      "nimbly",
      "openly",
      "proudly",
      "quickly",
      "rarely",
      "strongly",
      "tensely",
      "urgently",
      "vividly",
      "wildly",
      "xerically",
      "yearly",
      "zestfully",
    ];

    const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const useDigit: boolean = Math.random() < 0.5;
    const digit: number = Math.floor(Math.random() * 10);

    const adjective: string = rand(adjectives);
    const noun: string = rand(nounsSingular);
    const verb: string = rand(verbs);
    const adverb: string = rand(adverbs);

    const pluralize = (word: string): string => {
      if (word.endsWith("y") && !"aeiou".includes(word[word.length - 2])) {
        return word.slice(0, -1) + "ies";
      }

      if (word.endsWith("s") || word.endsWith("x") || word.endsWith("ch") || word.endsWith("sh")) {
        return word + "es";
      }

      return word + "s";
    };

    const deThirdPerson = (verb: string): string => {
      if (verb.endsWith("ies")) return verb.slice(0, -3) + "y";
      if (verb.endsWith("es")) return verb.slice(0, -2);
      if (verb.endsWith("s")) return verb.slice(0, -1);
      return verb;
    };

    let plainHeroCode: string;

    if (useDigit) {
      // Singular noun if digit === 1, plural otherwise
      const nounForNumber: string = digit === 1 ? noun : pluralize(noun);
      const verbForm: string = digit === 1 ? verb : deThirdPerson(verb);
      plainHeroCode = `The ${digit} ${adjective} ${nounForNumber} ${verbForm} ${adverb}`;
    } else {
      plainHeroCode = `${adjective} ${noun} ${verb} ${adverb}`;
    }

    CipherHeroManager.heroCodes.set(playerId, plainHeroCode.toUpperCase());

    const encryptedHeroCode: string = plainHeroCode
      .toUpperCase()
      .split("")
      .map((char: string) => CipherHeroManager.CIPHER_MAP[char] ?? char)
      .join("");

    return encryptedHeroCode;
  }

  /**
   * Decrypts a hero code string using the inverse of the predefined CIPHER_MAP.
   * This function reverses the encryption done by the hero code generator.
   *
   * @param code - The encrypted hero code (e.g., "3WR6 APBJ").
   * @returns The decrypted version of the code (e.g., "QROB 7AH6").
   */
  private static decryptHeroCode(code: string): string {
    const DECRYPT_CIPHER_MAP: Record<string, string> = Object.fromEntries(
      Object.entries(CipherHeroManager.CIPHER_MAP).map(([key, value]) => [value, key]),
    );

    return code
      .toUpperCase()
      .split("")
      .map((char: string) => DECRYPT_CIPHER_MAP[char] ?? char)
      .join("");
  }

  /**
   * Checks whether the given guessed code matches the decrypted hero code
   * stored for the specified user.
   *
   * @param playerId - The user ID to look up the hero code.
   * @param code - The guessed hero code to verify.
   * @returns True if the guessed code matches the decrypted hero code; otherwise, false.
   */
  public static isGuessedCodeMatchesHeroCode(playerId: string, code: string): boolean {
    const heroCode: string | undefined = CipherHeroManager.heroCodes.get(playerId);
    if (!heroCode) return false;
    return code.toUpperCase().includes(heroCode);
  }

  /**
   * Removes the hero code entry associated with the given user.
   *
   * @param playerId - The user ID whose hero code should be deleted.
   */
  public static removeHeroCode(playerId: string): void {
    CipherHeroManager.heroCodes.delete(playerId);
  }
}
