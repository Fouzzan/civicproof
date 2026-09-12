/**
 * Per-message language, decided in code rather than by the model.
 *
 * Sahayak has no language setting and stores no preference. Each message is
 * judged on its own, so a citizen who switches mid-conversation is followed on
 * that turn without being asked anything.
 *
 * Detection is a character count, not a language model: it is deterministic,
 * costs nothing, is trivially testable, and cannot be talked into a different
 * answer by the contents of a message.
 */
export type Language = "en" | "ml";

export const DEFAULT_LANGUAGE: Language = "en";

/** Malayalam block, U+0D00–U+0D7F. */
const MALAYALAM_CHARS = /[\u0D00-\u0D7F]/g;
const LATIN_LETTERS = /[A-Za-z]/g;

function count(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

/**
 * Decide the language of ONE message.
 *
 * English is the fallback whenever Malayalam does not clearly dominate. That
 * asymmetry is deliberate: replying in English to a Malayalam speaker is a
 * mild annoyance they can correct in one message, while replying in Malayalam
 * to someone who cannot read it leaves them stuck. A message carrying a
 * tracking reference or an English scheme name alongside Malayalam still reads
 * as Malayalam, because the Malayalam is what the person wrote.
 */
export function detectLanguage(text: string): Language {
  const malayalam = count(text, MALAYALAM_CHARS);

  if (malayalam === 0) {
    return "en";
  }

  return malayalam > count(text, LATIN_LETTERS) ? "ml" : "en";
}
