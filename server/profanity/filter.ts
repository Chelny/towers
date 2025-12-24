import { ProfanityFilter } from "db/enums";
import { PorterStemmer, PorterStemmerFr } from "natural/lib/natural/stemmers";
import english from "@/server/profanity/dictionnary/en.json";
import french from "@/server/profanity/dictionnary/fr.json";
import {
  isWordProfane,
  normalizeWord,
  sanitizeText,
  setProfaneWordsForNormalization,
} from "@/server/profanity/sanitizer";

interface FindWords {
  word: string
  start: number
  end: number
}

export const PROFANE_WORDS: string[] = [...english, ...french].sort();

export const PROFANE_WORDS_SET = new Set<string>();
export const PROFANE_WORDS_STEMMED_SET = new Set<string>();

for (const word of PROFANE_WORDS) {
  const sanitized: string = sanitizeText(word);
  PROFANE_WORDS_SET.add(sanitized);

  // Add English stem
  const englishStem: string = PorterStemmer.stem(sanitized);
  PROFANE_WORDS_STEMMED_SET.add(englishStem);

  // Add French stem
  const frenchStem: string = PorterStemmerFr.stem(sanitized);
  PROFANE_WORDS_STEMMED_SET.add(frenchStem);
}

setProfaneWordsForNormalization(PROFANE_WORDS_SET);

/**
 * Finds all words in text using regex that includes leet symbols.
 * Words can contain symbols in the middle (like "f.u.c.k") but not at boundaries.
 *
 * @param text - Text to extract words from
 * @returns Array of words with their start and end positions
 */
function findWords(text: string): FindWords[] {
  const words: FindWords[] = [];

  // Include $ in the character class since it's a leet symbol for 's'
  const regex: RegExp = /[\p{L}\d\$]+(?:[^\p{L}\s]*[\p{L}\d\$]+)*/gu;

  let match;
  while ((match = regex.exec(text)) !== null) {
    words.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return words;
}

/**
 * Masks a profane word according to the specified filter type.
 * Handles apostrophes specially and preserves original casing when possible.
 *
 * @param word - Word to mask
 * @param filter - Type of masking to apply (NONE, WEAK, STRONG)
 * @returns Masked version of the word
 */
function maskWord(word: string, filter: ProfanityFilter): string {
  if (filter === ProfanityFilter.NONE) return word;

  const hasApostrophe: boolean = /['’]/.test(word);

  if (hasApostrophe) {
    const apostropheIndex: number = word.search(/['’]/);
    const before: string = word.slice(0, apostropheIndex);
    const after: string = word.slice(apostropheIndex);
    const normalizedBefore: string = normalizeWord(before);
    const count: number = normalizedBefore.length;

    if (count === 0) return word;

    // Use normalized first letter for leet handling
    let firstLetter: string = normalizedBefore[0] || "";

    // Preserve case from original
    const firstAlphaChar: string = before.match(/[a-zA-Z]/)?.[0] || "";
    if (firstAlphaChar && firstAlphaChar === firstAlphaChar.toUpperCase()) {
      firstLetter = firstLetter.toUpperCase();
    }

    if (filter === ProfanityFilter.STRONG) {
      return "*".repeat(count) + after;
    } else {
      return firstLetter + "*".repeat(count - 1) + after;
    }
  }

  const normalized: string = normalizeWord(word);
  const length: number = normalized.length;

  if (length === 0) return word;

  // Use normalized first letter (handles leet symbols correctly)
  let firstLetter: string = normalized[0] || "";

  // Preserve case from original word's first alphabetic character
  const firstAlphaChar: string = word.match(/[a-zA-Z]/)?.[0] || "";
  if (firstAlphaChar && firstAlphaChar === firstAlphaChar.toUpperCase()) {
    firstLetter = firstLetter.toUpperCase();
  }

  if (filter === ProfanityFilter.STRONG) {
    return "*".repeat(length);
  } else {
    return firstLetter + "*".repeat(length - 1);
  }
}

/**
 * Filters profanity from text by masking profane words according to the filter type.
 * Preserves non-profane words and original punctuation/casing.
 *
 * @param text - Text to filter
 * @param filterType - Type of filtering to apply
 * @returns Text with profane words masked
 */
export function filterProfanity(text: string, filterType: ProfanityFilter = ProfanityFilter.WEAK): string {
  if (filterType === ProfanityFilter.NONE) return text;

  // console.log(`Profanity Filter - Processing text: "${text}"`);

  const words: FindWords[] = findWords(text);
  // console.log(`Profanity Filter - Found ${words.length} words:`, words.map(w => w.word));

  let result: string = "";
  let lastIndex: number = 0;

  for (const wordInfo of words) {
    if (wordInfo.start > lastIndex) {
      result += text.slice(lastIndex, wordInfo.start);
    }

    // console.log(`Profanity Filter - Checking word "${wordInfo.word}" at position ${wordInfo.start}-${wordInfo.end}`);

    const isProfaneWord: boolean = isWordProfane(wordInfo.word, PROFANE_WORDS_SET);
    // console.log(`Profanity Filter - isProfaneWord("${wordInfo.word}") = ${isProfaneWord}`);

    if (isProfaneWord) {
      const masked: string = maskWord(wordInfo.word, filterType);
      // console.log(`Profanity Filter - Masking "${wordInfo.word}" as "${masked}"`);
      result += masked;
    } else {
      // console.log(`Profanity Filter - Not masking "${wordInfo.word}"`);
      result += wordInfo.word;
    }

    lastIndex = wordInfo.end;
  }

  if (lastIndex < text.length) {
    result += text.slice(lastIndex);
  }

  // console.log(`Profanity Filter - Final result: "${result}"`);
  return result;
}
