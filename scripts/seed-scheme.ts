import { existsSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { DEMO_SCHEME } from "../lib/schemes/demo-scheme.ts";

/**
 * Seed the single demonstration scheme.
 *
 * Idempotent: re-running never creates a duplicate and never orphans
 * applications already pointing at the existing row.
 *
 *   node --experimental-strip-types scripts/seed-scheme.ts
 *
 * Standalone rather than importing lib/schemes/repository.ts, because the app's
 * "@/" path alias is a bundler feature that plain Node does not resolve.
 */
for (const envFile of [".env", ".env.local"] as const) {
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  process.stderr.write("DATABASE_URL is not set. Add it to .env.local.\n");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  const data = {
    name: DEMO_SCHEME.name,
    summary: DEMO_SCHEME.summary,
    isDemo: DEMO_SCHEME.isDemo,
    isActive: true,
    eligibilityRules: DEMO_SCHEME.rules,
    requiredFields: DEMO_SCHEME.facts,
  };

  const result = await prisma.scheme.upsert({
    where: { slug: DEMO_SCHEME.slug },
    update: data,
    create: { slug: DEMO_SCHEME.slug, ...data },
  });

  process.stdout.write(
    `Seeded "${result.name}" (${result.slug})\n` +
      `  demo scheme : ${result.isDemo}\n` +
      `  criteria    : ${DEMO_SCHEME.rules.length}\n` +
      `  facts       : ${DEMO_SCHEME.facts.length} ` +
      `(${DEMO_SCHEME.facts.filter((f) => f.forEligibility).length} for eligibility)\n`,
  );
} catch (error) {
  process.stderr.write(`Seed failed: ${error instanceof Error ? error.message : "unknown"}\n`);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
