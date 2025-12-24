import { ProfanityFilter } from "db/enums";
import { filterProfanity } from "@/server/profanity/filter";
import { PROFANE_WORDS_SET } from "@/server/profanity/filter";
import { isWordProfane, normalizeWord } from "@/server/profanity/sanitizer";

describe("Profanity filter", () => {
  it("should normalize words", () => {
    expect(normalizeWord("f.u.c.k")).toBe("fuck");
    expect(normalizeWord("sh!t")).toBe("shit");
    expect(normalizeWord("6!tch")).toBe("bitch");
    expect(normalizeWord("t@b@rn@k")).toBe("tabarnak");
    expect(normalizeWord("câliss3")).toBe("calisse");
    expect(normalizeWord("m∂rde")).toBe("marde");
    expect(normalizeWord("n!gger")).toBe("nigger");
    expect(normalizeWord("N|GG3Я")).toBe("nigger");
    expect(normalizeWord("N|663Яs")).toBe("niggers");
    expect(normalizeWord("ni66a")).toBe("nigga");
    expect(normalizeWord("a$$")).toBe("ass");
    expect(normalizeWord("phaggot")).toBe("faggot");
    expect(normalizeWord("vvh0re")).toBe("whore");
    expect(normalizeWord("cunt's")).toBe("cunts");
    expect(normalizeWord("cunt's")).toBe("cunts");
  });

  it.skip("should normalize words with repeated letters", () => {
    expect(normalizeWord("fuccck")).toBe("fuck");
    expect(normalizeWord("shiiiiiiit")).toBe("shit");
    expect(normalizeWord("biiiiitchhhhh")).toBe("bitch");
    expect(normalizeWord("tabbbaaaarnaaaak")).toBe("tabarnak");
    expect(normalizeWord("câaaalisssssse")).toBe("calisse");
    expect(normalizeWord("mardeeeeeee")).toBe("marde");
    // expect(normalizeWord("niggerrrr")).toBe("nigger"); // Will conflict with "Niger"
    // expect(normalizeWord("assssss")).toBe("ass"); // Will conflict with "as"
  });

  it("should detect basic profane words", () => {
    expect(isWordProfane("fuck", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("shit", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("bitch", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("tabarnak", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("câlisse", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("marde", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("nigger", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("ass", PROFANE_WORDS_SET)).toBe(true);
  });

  it("should detect leet speak variations", () => {
    expect(isWordProfane("fuck€r", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("sh!t", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("B!tch", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("t@b@rn@k", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("câliss3", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("m∂rde", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("n1gger", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("ni66a", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("a$$", PROFANE_WORDS_SET)).toBe(true);
  });

  it("should not flag harmless words", () => {
    expect(isWordProfane("classification", PROFANE_WORDS_SET)).toBe(false);
    expect(isWordProfane("cumulate", PROFANE_WORDS_SET)).toBe(false);
    expect(isWordProfane("negociate", PROFANE_WORDS_SET)).toBe(false);
    expect(isWordProfane("titulaire", PROFANE_WORDS_SET)).toBe(false);
  });

  it("should detect verb conjugations", () => {
    // English
    expect(isWordProfane("fucking", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("fucked", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("fucks", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("shitting", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("bitches", PROFANE_WORDS_SET)).toBe(true);

    // French
    expect(isWordProfane("chiant", PROFANE_WORDS_SET)).toBe(true); // from "chier"
    expect(isWordProfane("chiante", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("emmerdant", PROFANE_WORDS_SET)).toBe(true); // from "emmerder"
    expect(isWordProfane("emmerdé", PROFANE_WORDS_SET)).toBe(true);
  });

  it.skip("should detect profane words with repeated letters", () => {
    expect(isWordProfane("fuccck", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("shiiiiiiit", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("biiiiitchhhhh", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("tabbbaaaarnaaaak", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("câaaalisssssse", PROFANE_WORDS_SET)).toBe(true);
    expect(isWordProfane("mardeeeeeee", PROFANE_WORDS_SET)).toBe(true);
    // expect(isWordProfane("niggerrrr", PROFANE_WORDS_SET)).toBe(true); // Will conflict with "Niger"
    // expect(isWordProfane("assssss", PROFANE_WORDS_SET)).toBe(true); // Will conflict with "as"
  });

  it("should apply weak masking correctly", () => {
    expect(filterProfanity("Esti, this cunt's game is f.u.c.k.i.n.g broken tabarnak!", ProfanityFilter.WEAK)).toBe(
      "E***, this c***'s game is f****** broken t*******!",
    );

    expect(filterProfanity("This game is fucking awesome", ProfanityFilter.WEAK)).toBe("This game is f****** awesome");

    expect(filterProfanity("Tabarnak! Câlisse de jeu", ProfanityFilter.WEAK)).toBe("T*******! C****** de jeu");
  });

  it("should apply strong masking correctly", () => {
    expect(filterProfanity("What the f.u.c.k is happening?", ProfanityFilter.STRONG)).toBe(
      "What the **** is happening?",
    );

    expect(filterProfanity("Osti de marde!", ProfanityFilter.STRONG)).toBe("**** de *****!");

    expect(filterProfanity("Fuck Shit bitch Tabarnak", ProfanityFilter.STRONG)).toBe("**** **** ***** ********");
  });

  it("should preserve original casing and punctuation", () => {
    expect(filterProfanity("FuCk!!!", ProfanityFilter.WEAK)).toBe("F***!!!");
    expect(filterProfanity("ShIt???", ProfanityFilter.STRONG)).toBe("****???");
  });
});
