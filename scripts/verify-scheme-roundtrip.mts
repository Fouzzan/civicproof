import { existsSync } from "node:fs";

for (const f of [".env", ".env.local"] as const) {
  if (existsSync(f)) process.loadEnvFile(f);
}

const { prisma } = await import("../lib/db/index.ts");
const { DEMO_SCHEMES } = await import("../lib/schemes/catalog/index.ts");
const { listActiveStoredSchemes, getSchemeBySlug } = await import(
  "../lib/schemes/repository.ts"
);
const { checkEligibility } = await import("../lib/eligibility/checker.ts");

/**
 * Prove every stored scheme survives the database round-trip.
 *
 * The catalogue passing validation proves nothing about the rows: JSON columns
 * lose types. This reads what is actually stored, through the same repository
 * the engine uses, and evaluates eligibility from the DATABASE definition.
 *
 *   npx --yes tsx scripts/verify-scheme-roundtrip.mts
 */
const problems: string[] = [];
let checks = 0;

function check(name: string, ok: boolean, detail = "") {
  checks += 1;
  process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) problems.push(name);
}

try {
  const stored = await listActiveStoredSchemes();

  check(
    "all six catalogue schemes are active in the database",
    stored.length === DEMO_SCHEMES.length,
    `${stored.length} active`,
  );

  check(
    "the retired single-scheme pilot is no longer active",
    !stored.some((entry) => entry.definition.slug === "demo-farmer-income-support"),
  );

  for (const expected of DEMO_SCHEMES) {
    const fromDb = await getSchemeBySlug(expected.slug);

    if (!fromDb) {
      check(`${expected.category}: stored and parseable`, false, "not found");
      continue;
    }

    check(
      `${expected.category}: stored, parsed and complete`,
      fromDb.category === expected.category &&
        fromDb.rules.length === expected.rules.length &&
        fromDb.facts.length === expected.facts.length &&
        fromDb.benefits.length === expected.benefits.length &&
        fromDb.targetGroups.length === expected.targetGroups.length &&
        fromDb.isDemo,
    );

    // Eligibility computed from the DATABASE row, not the catalogue.
    const satisfying: Record<string, number | boolean | string> = {};
    for (const rule of fromDb.rules) {
      if (rule.kind === "boolean") satisfying[rule.fact] = rule.expected;
      else if (rule.kind === "range") satisfying[rule.fact] = (rule.min + rule.max) / 2;
      else
        satisfying[rule.fact] =
          rule.op === "gte" || rule.op === "lte" ? rule.value
          : rule.op === "gt" ? rule.value + 1
          : rule.value - 1;
    }

    check(
      `${expected.category}: DB-loaded rules evaluate to LIKELY_ELIGIBLE`,
      checkEligibility(fromDb, satisfying).outcome === "LIKELY_ELIGIBLE",
    );
  }

  // Provenance must be present and honest.
  const provenanceOk = stored.every(
    (entry) =>
      entry.provenance.version >= 1 &&
      entry.provenance.sourceLabel.toLowerCase().includes("fictional"),
  );
  check("every scheme carries a version and a fictional source label", provenanceOk);

  check(
    "no scheme claims verification it has not had",
    stored.every((entry) => entry.provenance.lastVerified === null),
    "lastVerified is null until a human verifies it",
  );
} catch (error) {
  problems.push(error instanceof Error ? error.message : "unknown error");
  process.stdout.write(`\n  THREW: ${error instanceof Error ? error.stack : error}\n`);
} finally {
  await prisma.$disconnect();
}

process.stdout.write(
  problems.length === 0
    ? `\nAll ${checks} round-trip checks passed.\n`
    : `\n${problems.length} of ${checks} failed.\n`,
);
process.exit(problems.length === 0 ? 0 : 1);
