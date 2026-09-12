import { DEMO_SCHEME } from "../lib/schemes/demo-scheme.ts";
import { checkEligibility, missingFactsFor } from "../lib/eligibility/checker.ts";

/**
 * Verification for the deterministic eligibility checker.
 *
 * Covers the cases named in Docs/12-IMPLEMENTATION-PLAN-TRANSITION.md §4.
 * Runs with no test framework and no database:
 *
 *   node --experimental-strip-types scripts/verify-eligibility.ts
 */
type Case = {
  readonly name: string;
  readonly facts: Record<string, number | boolean | string>;
  readonly expect: string;
  readonly expectFailedIds?: readonly string[];
  readonly expectMissing?: readonly string[];
};

const ELIGIBLE = {
  age: 62,
  annualHouseholdIncome: 90_000,
  landHectares: 1.2,
  isStateResident: true,
};

const CASES: readonly Case[] = [
  { name: "fully eligible", facts: ELIGIBLE, expect: "LIKELY_ELIGIBLE" },
  {
    name: "one failed criterion (income too high)",
    facts: { ...ELIGIBLE, annualHouseholdIncome: 500_000 },
    expect: "NOT_ELIGIBLE",
    expectFailedIds: ["income-ceiling"],
  },
  {
    name: "multiple failed criteria (age + land + residency)",
    facts: { age: 15, annualHouseholdIncome: 90_000, landHectares: 8, isStateResident: false },
    expect: "NOT_ELIGIBLE",
    expectFailedIds: ["minimum-age", "smallholding", "state-residency"],
  },
  {
    name: "missing one fact",
    facts: { age: 62, annualHouseholdIncome: 90_000, landHectares: 1.2 },
    expect: "MORE_INFORMATION_NEEDED",
    expectMissing: ["isStateResident"],
  },
  {
    name: "missing several facts",
    facts: { age: 62 },
    expect: "MORE_INFORMATION_NEEDED",
    expectMissing: ["annualHouseholdIncome", "landHectares", "isStateResident"],
  },
  {
    name: "no facts at all",
    facts: {},
    expect: "MORE_INFORMATION_NEEDED",
    expectMissing: ["age", "annualHouseholdIncome", "landHectares", "isStateResident"],
  },
  {
    name: "invalid fact type (age as text) is UNKNOWN, never a silent pass",
    facts: { ...ELIGIBLE, age: "sixty two" },
    expect: "MORE_INFORMATION_NEEDED",
    expectMissing: [],
  },
  {
    name: "boundary: exactly at every threshold passes",
    facts: { age: 18, annualHouseholdIncome: 200_000, landHectares: 2, isStateResident: true },
    expect: "LIKELY_ELIGIBLE",
  },
  {
    name: "boundary: just outside the land range fails",
    facts: { ...ELIGIBLE, landHectares: 2.01 },
    expect: "NOT_ELIGIBLE",
    expectFailedIds: ["smallholding"],
  },
  {
    name: "definitive failure short-circuits further questions",
    facts: { age: 15 },
    expect: "NOT_ELIGIBLE",
    expectFailedIds: ["minimum-age"],
    expectMissing: [],
  },
];

const problems: string[] = [];

for (const testCase of CASES) {
  const result = checkEligibility(DEMO_SCHEME, testCase.facts);
  const failedIds = result.criteria.filter((c) => c.status === "FAILED").map((c) => c.id);
  const issues: string[] = [];

  if (result.outcome !== testCase.expect) {
    issues.push(`outcome ${result.outcome} (expected ${testCase.expect})`);
  }

  if (testCase.expectFailedIds) {
    const want = [...testCase.expectFailedIds].sort().join(",");
    const got = [...failedIds].sort().join(",");
    if (want !== got) issues.push(`failed=[${got}] (expected [${want}])`);
  }

  if (testCase.expectMissing) {
    const want = [...testCase.expectMissing].sort().join(",");
    const got = [...result.missingFacts].sort().join(",");
    if (want !== got) issues.push(`missing=[${got}] (expected [${want}])`);
  }

  // Every FAILED criterion must carry an explanation, or the agent would have
  // to invent one.
  for (const criterion of result.criteria) {
    if (criterion.status === "FAILED" && !criterion.failureHint) {
      issues.push(`criterion ${criterion.id} FAILED with no failureHint`);
    }
    if (criterion.status !== "FAILED" && criterion.failureHint) {
      issues.push(`criterion ${criterion.id} is ${criterion.status} but carries a failureHint`);
    }
  }

  const status = issues.length === 0 ? "PASS" : "FAIL";
  process.stdout.write(`  [${status}] ${testCase.name}\n`);
  for (const issue of issues) {
    process.stdout.write(`         ${issue}\n`);
    problems.push(`${testCase.name}: ${issue}`);
  }
}

// Application facts are a superset of eligibility facts.
const appMissing = missingFactsFor(DEMO_SCHEME, ELIGIBLE, "application");
const expectedAppMissing = ["fullName", "district"];
if ([...appMissing].sort().join(",") !== [...expectedAppMissing].sort().join(",")) {
  problems.push(`application missing=[${appMissing.join(",")}]`);
  process.stdout.write(`  [FAIL] application facts: got [${appMissing.join(",")}]\n`);
} else {
  process.stdout.write(`  [PASS] application asks only for fullName + district once eligible\n`);
}

// Determinism: the same input must always give the same answer.
const a = JSON.stringify(checkEligibility(DEMO_SCHEME, ELIGIBLE));
const b = JSON.stringify(checkEligibility(DEMO_SCHEME, ELIGIBLE));
if (a !== b) {
  problems.push("checker is not deterministic");
  process.stdout.write("  [FAIL] determinism\n");
} else {
  process.stdout.write("  [PASS] repeated evaluation is byte-identical\n");
}

process.stdout.write(
  problems.length === 0
    ? `\nAll checks passed (${CASES.length + 2}).\n`
    : `\n${problems.length} problem(s).\n`,
);
process.exit(problems.length === 0 ? 0 : 1);
