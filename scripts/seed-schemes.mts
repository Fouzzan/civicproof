import { existsSync } from "node:fs";

for (const f of [".env", ".env.local"] as const) {
  if (existsSync(f)) process.loadEnvFile(f);
}

const { prisma } = await import("../lib/db/index.ts");
const { DEMO_SCHEMES } = await import("../lib/schemes/catalog/index.ts");

/**
 * Seed the demonstration catalogue.
 *
 * Idempotent: re-running never duplicates a scheme and never orphans
 * applications already pointing at one.
 *
 *   npx --yes tsx scripts/seed-schemes.mts
 *
 * Deliberately does NOT touch `version` or `lastVerified`. Those record what a
 * human approved through Scheme Intelligence, and a re-seed must not quietly
 * reset that history or claim a verification that never happened.
 */
try {
  for (const scheme of DEMO_SCHEMES) {
    const data = {
      name: scheme.name,
      summary: scheme.summary,
      category: scheme.category,
      benefits: scheme.benefits,
      targetGroups: scheme.targetGroups,
      requiredDocuments: scheme.requiredDocuments,
      sourceLabel: scheme.sourceLabel,
      isDemo: scheme.isDemo,
      isActive: true,
      eligibilityRules: scheme.rules,
      requiredFields: scheme.facts,
    };

    const row = await prisma.scheme.upsert({
      where: { slug: scheme.slug },
      update: data,
      create: { slug: scheme.slug, ...data },
    });

    process.stdout.write(
      `  ${row.category.padEnd(16)} ${row.name.padEnd(30)} ` +
        `v${row.version}  ${scheme.rules.length} rules  ${scheme.facts.length} facts\n`,
    );
  }

  const active = await prisma.scheme.count({ where: { isActive: true } });
  process.stdout.write(`\nSeeded ${DEMO_SCHEMES.length} schemes. ${active} active in total.\n`);

  // The single-scheme pilot is superseded by farmer-income-support. Retired
  // rather than deleted: an Application may still reference it, and the FK is
  // onDelete: Restrict.
  const retired = await prisma.scheme.updateMany({
    where: { slug: "demo-farmer-income-support", isActive: true },
    data: { isActive: false },
  });

  if (retired.count > 0) {
    process.stdout.write("Retired the earlier demo-farmer-income-support pilot row.\n");
  }
} catch (error) {
  process.stderr.write(`Seed failed: ${error instanceof Error ? error.message : "unknown"}\n`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
