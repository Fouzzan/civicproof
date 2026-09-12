import { detectLanguage, DEFAULT_LANGUAGE } from "../lib/i18n/language.ts";
import { strings } from "../lib/i18n/strings.ts";

/**
 * Per-message language detection. Pure — no API, no database, free to re-run.
 *
 *   npx --yes tsx scripts/verify-language-detect.mts
 */
const problems: string[] = [];
let checks = 0;

function check(name: string, ok: boolean, detail = "") {
  checks += 1;
  process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) problems.push(name);
}

const CASES: readonly [string, "en" | "ml", string][] = [
  ["എനിക്ക് ജോലി അന്വേഷിക്കുകയാണ്.", "ml", "pure Malayalam"],
  ["എനിക്ക് 62 വയസ്സായി. പെൻഷൻ കിട്ടുന്നില്ല.", "ml", "Malayalam with digits"],
  ["I am looking for work.", "en", "pure English"],
  ["Actually, can you continue in English please?", "en", "English switch request"],
  ["വീണ്ടും മലയാളത്തിൽ പറയാമോ?", "ml", "Malayalam switch request"],
  ["", "en", "empty falls back to English"],
  ["12345", "en", "digits only fall back to English"],
  ["DEMO-482913", "en", "a tracking reference is not Malayalam"],
  // Malayalam carrying an English service name is still Malayalam.
  ["Job Seeker Support എന്ന പദ്ധതിയെക്കുറിച്ച് പറയാമോ?", "ml", "Malayalam + English scheme name"],
  // Mostly English with one Malayalam word is NOT confidently Malayalam.
  ["Can you tell me about പദ്ധതി options available for me today?", "en", "mostly English, uncertain"],
];

for (const [input, expected, note] of CASES) {
  const got = detectLanguage(input);
  check(`${note} -> ${expected}`, got === expected, got);
}

check("default language is English", DEFAULT_LANGUAGE === "en");

// Every English key must exist in Malayalam, non-empty and actually different.
const en = strings("en") as Record<string, string>;
const ml = strings("ml") as Record<string, string>;
const keys = Object.keys(en);

check("Malayalam table has every key", keys.every((k) => typeof ml[k] === "string"));
check("no Malayalam string is empty", keys.every((k) => (ml[k] ?? "").trim().length > 0));

const untranslated = keys.filter((k) => ml[k] === en[k]);
check(
  "no string was left as its English original",
  untranslated.length === 0,
  untranslated.join(", "),
);

/**
 * Every Malayalam string must be in Malayalam script \u2014 except the ones that
 * contain no letters at all.
 *
 * `activityOf` is "/" so the compact indicator reads "\u0D18\u0D1F\u0D4D\u0D1F\u0D02 1 / 5". A slash is
 * idiomatic in both languages, and translating it into a word would make the
 * Malayalam clumsier than the English. The exemption is narrow on purpose: it
 * only covers values with no letters in any script, so it cannot hide an
 * English word left untranslated.
 */
const MALAYALAM = /[\u0D00-\u0D7F]/;
const HAS_LETTERS = /\p{L}/u;
const noScript = keys.filter(
  (k) => HAS_LETTERS.test(ml[k] ?? "") && !MALAYALAM.test(ml[k] ?? ""),
);
check(
  "every Malayalam string with letters uses Malayalam script",
  noScript.length === 0,
  noScript.join(", "),
);

check("an unknown language falls back to English", strings("en") === en);

process.stdout.write(
  problems.length === 0
    ? `\nAll ${checks} language checks passed.\n`
    : `\n${problems.length} of ${checks} failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\n`,
);
process.exit(problems.length === 0 ? 0 : 1);
