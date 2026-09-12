import { DEMO_SCHEMES } from "../lib/schemes/catalog/index.ts";
import { normaliseFacts } from "../lib/schemes/facts.ts";

/**
 * Malayalam yes/no handling in the fact normaliser.
 *
 * No API and no database — this is a pure function, so the whole file costs
 * nothing to run and can be repeated freely.
 *
 *   npx --yes tsx scripts/verify-malayalam-facts.mts
 */
const housing = DEMO_SCHEMES.find((s) => s.slug === "basic-housing-assistance")!;
const senior = DEMO_SCHEMES.find((s) => s.slug === "senior-citizen-assistance")!;

const problems: string[] = [];
let checks = 0;

function check(name: string, ok: boolean, detail = "") {
  checks += 1;
  process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) problems.push(name);
}

/** Accepted → the value it must become. */
const ACCEPTED: readonly [string, boolean][] = [
  ["അതെ", true],
  ["ഉവ്വ്", true],
  ["ഉണ്ട്", true],
  ["ഇല്ല", false],
  ["അല്ല", false],
  // The pre-existing vocabulary must keep working.
  ["yes", true],
  ["no", false],
  ["haan", true],
  ["nahi", false],
];

for (const [word, expected] of ACCEPTED) {
  const { accepted, rejected } = normaliseFacts(housing, { ownsHome: word });
  check(
    `"${word}" -> ${expected}`,
    accepted.ownsHome === expected && rejected.length === 0,
    rejected[0]?.reason ?? String(accepted.ownsHome),
  );
}

/**
 * Rejected → asked again, never guessed.
 *
 * The sentence cases matter most: matching is whole-string, so a word that
 * merely CONTAINS ഇല്ല must not be read as "no".
 */
const REJECTED: readonly string[] = [
  "എനിക്ക് വീടില്ല",      // "I have no house" — contains ഇല്ല but is a sentence
  "വേണം",                  // "I want" — a wish, not a fact
  "വേണ്ട",                 // "don't want" — likewise
  "ഒരുപക്ഷേ",              // "maybe"
  "",
];

for (const word of REJECTED) {
  const { accepted, rejected } = normaliseFacts(housing, { ownsHome: word });
  check(
    `"${word || "(empty)"}" is rejected, not guessed`,
    accepted.ownsHome === undefined && rejected.length === 1,
    JSON.stringify(accepted),
  );
}

// A real boolean from the model must still pass straight through.
const direct = normaliseFacts(senior, { receivesPension: false, age: 62 });
check(
  "a boolean from the model passes through untouched",
  direct.accepted.receivesPension === false && direct.accepted.age === 62,
);

// Malayalam digits are not used for numbers here; a numeral string still works.
const numeric = normaliseFacts(senior, { age: "62" });
check("numeric string still normalises", numeric.accepted.age === 62);

// Whole-string matching must not be case- or space-sensitive for ASCII.
const spaced = normaliseFacts(housing, { ownsHome: "  അതെ  " });
check("surrounding whitespace is trimmed", spaced.accepted.ownsHome === true);

process.stdout.write(
  problems.length === 0
    ? `\nAll ${checks} Malayalam fact checks passed.\n`
    : `\n${problems.length} of ${checks} failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\n`,
);
process.exit(problems.length === 0 ? 0 : 1);
