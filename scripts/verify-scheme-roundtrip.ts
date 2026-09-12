import { existsSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { checkEligibility } from "../lib/eligibility/checker.ts";
import { eligibilityRuleSchema, schemeFactSchema } from "../lib/schemes/types.ts";

/**
 * Prove the stored scheme survives the database round-trip.
 *
 * The in-code definition passing validation proves nothing about the row: JSON
 * columns lose types. This reads what is actually stored and validates it with
 * the same schemas lib/schemes/repository.ts uses, then evaluates eligibility
 * from the DATABASE definition.
 */
for (const envFile of [".env", ".env.local"] as const) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const storedSchemeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  isDemo: z.boolean(),
  requiredFields: z.array(schemeFactSchema).min(1),
  eligibilityRules: z.array(eligibilityRuleSchema).min(1),
});

const problems: string[] = [];

try {
  const row = await prisma.scheme.findFirst({
    where: { slug: "demo-farmer-income-support", isActive: true },
  });

  if (!row) {
    problems.push("scheme row not found");
  } else {
    const parsed = storedSchemeSchema.safeParse(row);

    if (!parsed.success) {
      problems.push(`stored JSON failed validation: ${parsed.error.issues[0]?.message}`);
      process.stdout.write("  [FAIL] stored rules parse\n");
    } else {
      process.stdout.write(
        `  [PASS] stored rules parse (${parsed.data.eligibilityRules.length} rules, ` +
          `${parsed.data.requiredFields.length} facts)\n`,
      );

      const fromDb = {
        slug: parsed.data.slug,
        name: parsed.data.name,
        summary: parsed.data.summary,
        isDemo: parsed.data.isDemo,
        facts: parsed.data.requiredFields,
        rules: parsed.data.eligibilityRules,
      };

      const eligible = checkEligibility(fromDb, {
        age: 62,
        annualHouseholdIncome: 90_000,
        landHectares: 1.2,
        isStateResident: true,
      });
      const ineligible = checkEligibility(fromDb, {
        age: 62,
        annualHouseholdIncome: 900_000,
        landHectares: 1.2,
        isStateResident: true,
      });

      for (const [label, result, want] of [
        ["eligible facts", eligible, "LIKELY_ELIGIBLE"],
        ["over-income facts", ineligible, "NOT_ELIGIBLE"],
      ] as const) {
        const ok = result.outcome === want;
        process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] DB-loaded scheme, ${label} -> ${result.outcome}\n`);
        if (!ok) problems.push(`${label}: got ${result.outcome}`);
      }

      if (!parsed.data.isDemo) {
        problems.push("isDemo is false - the UI would not label this as a demonstration");
        process.stdout.write("  [FAIL] isDemo flag\n");
      } else {
        process.stdout.write("  [PASS] isDemo is true, so every surface labels it a demo\n");
      }
    }
  }
} catch (error) {
  problems.push(error instanceof Error ? error.message : "unknown error");
} finally {
  await prisma.$disconnect();
}

process.stdout.write(problems.length === 0 ? "\nRound-trip verified.\n" : `\n${problems.length} problem(s).\n`);
process.exit(problems.length === 0 ? 0 : 1);
