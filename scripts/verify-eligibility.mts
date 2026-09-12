import { DEMO_SCHEMES } from "../lib/schemes/catalog/index.ts";
import { checkEligibility, missingFactsFor } from "../lib/eligibility/checker.ts";
import type { SchemeDefinition } from "../lib/schemes/types.ts";

/**
 * Verification for the deterministic eligibility checker, across every category.
 *
 * Runs against the CATALOGUE definitions, with no database and no model, so a
 * failure here is always a logic error rather than an environment one.
 *
 *   npx --yes tsx scripts/verify-eligibility.mts
 */
type Facts = Record<string, number | boolean | string>;

const problems: string[] = [];
let checks = 0;

function check(name: string, ok: boolean, detail = "") {
  checks += 1;
  process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) problems.push(name);
}

/**
 * A fact set that satisfies every rule of a scheme.
 *
 * Derived FROM the rules rather than hand-written per scheme, so adding a
 * scheme to the catalogue cannot leave a stale fixture silently passing.
 */
function satisfyingFacts(scheme: SchemeDefinition): Facts {
  const facts: Facts = {};

  for (const rule of scheme.rules) {
    if (rule.kind === "boolean") {
      facts[rule.fact] = rule.expected;
    } else if (rule.kind === "range") {
      facts[rule.fact] = (rule.min + rule.max) / 2;
    } else {
      facts[rule.fact] =
        rule.op === "gte" ? rule.value : rule.op === "gt" ? rule.value + 1
        : rule.op === "lte" ? rule.value : rule.value - 1;
    }
  }

  return facts;
}

/** Break exactly one rule, leaving the rest satisfied. */
function breakRule(scheme: SchemeDefinition, ruleId: string): Facts {
  const facts = satisfyingFacts(scheme);
  const rule = scheme.rules.find((candidate) => candidate.id === ruleId);

  if (!rule) return facts;

  if (rule.kind === "boolean") {
    facts[rule.fact] = !rule.expected;
  } else if (rule.kind === "range") {
    facts[rule.fact] = rule.max + 1;
  } else {
    facts[rule.fact] =
      rule.op === "gte" || rule.op === "gt" ? rule.value - 1 : rule.value + 1;
  }

  return facts;
}

process.stdout.write(`Catalogue: ${DEMO_SCHEMES.length} schemes\n\n`);

// --- Catalogue-wide invariants --------------------------------------------
const slugs = DEMO_SCHEMES.map((s) => s.slug);
check("every slug is unique", new Set(slugs).size === slugs.length);
check(
  "every category is represented exactly once",
  new Set(DEMO_SCHEMES.map((s) => s.category)).size === DEMO_SCHEMES.length,
);
check("every scheme is flagged isDemo", DEMO_SCHEMES.every((s) => s.isDemo));
check(
  "every rule references a fact the scheme defines",
  DEMO_SCHEMES.every((s) =>
    s.rules.every((r) => s.facts.some((f) => f.id === r.fact && f.forEligibility)),
  ),
);
check(
  "every scheme asks for a name and district for the application",
  DEMO_SCHEMES.every((s) =>
    ["fullName", "district"].every((id) =>
      s.facts.some((f) => f.id === id && f.forApplication),
    ),
  ),
);

// DATA MINIMISATION: the catalogue must not be able to ask for these at all.
const FORBIDDEN = ["aadhaar", "pan", "bank", "password", "otp", "biometric", "ration"];
const offending = DEMO_SCHEMES.flatMap((s) =>
  s.facts
    .filter((f) =>
      FORBIDDEN.some(
        (word) =>
          f.id.toLowerCase().includes(word) || f.label.toLowerCase().includes(word),
      ),
    )
    .map((f) => `${s.slug}.${f.id}`),
);
check("no scheme asks for sensitive identifiers", offending.length === 0, offending.join(", "));

process.stdout.write("\n");

// --- Per-scheme behaviour --------------------------------------------------
for (const scheme of DEMO_SCHEMES) {
  const eligible = checkEligibility(scheme, satisfyingFacts(scheme));
  check(`${scheme.category}: satisfying facts -> LIKELY_ELIGIBLE`, eligible.outcome === "LIKELY_ELIGIBLE", eligible.outcome);

  const empty = checkEligibility(scheme, {});
  check(
    `${scheme.category}: no facts -> MORE_INFORMATION_NEEDED`,
    empty.outcome === "MORE_INFORMATION_NEEDED" &&
      empty.missingFacts.length === scheme.facts.filter((f) => f.forEligibility).length,
  );

  // Each rule, broken on its own, must be the one that fails.
  for (const rule of scheme.rules) {
    const result = checkEligibility(scheme, breakRule(scheme, rule.id));
    const failed = result.criteria.filter((c) => c.status === "FAILED").map((c) => c.id);

    check(
      `${scheme.category}: breaking "${rule.id}" fails exactly that rule`,
      result.outcome === "NOT_ELIGIBLE" && failed.length === 1 && failed[0] === rule.id,
      failed.join(",") || result.outcome,
    );
  }
}

process.stdout.write("\n");

// --- Cross-cutting behaviour ----------------------------------------------
const student = DEMO_SCHEMES.find((s) => s.category === "EDUCATION")!;

const badType = checkEligibility(student, { ...satisfyingFacts(student), age: "twenty two" });
check(
  "an unusable fact value is UNKNOWN, never a silent pass",
  badType.outcome === "MORE_INFORMATION_NEEDED",
  badType.outcome,
);

check(
  "every FAILED criterion carries an explanation",
  DEMO_SCHEMES.every((s) =>
    s.rules.every((r) =>
      checkEligibility(s, breakRule(s, r.id)).criteria.every(
        (c) => (c.status === "FAILED") === (c.failureHint !== null),
      ),
    ),
  ),
);

const once = JSON.stringify(checkEligibility(student, satisfyingFacts(student)));
const twice = JSON.stringify(checkEligibility(student, satisfyingFacts(student)));
check("repeated evaluation is byte-identical", once === twice);

check(
  "application facts are only requested once eligibility facts are known",
  missingFactsFor(student, satisfyingFacts(student), "application").sort().join(",") ===
    "district,fullName",
);

process.stdout.write(
  problems.length === 0
    ? `\nAll ${checks} eligibility checks passed.\n`
    : `\n${problems.length} of ${checks} failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\n`,
);
process.exit(problems.length === 0 ? 0 : 1);
