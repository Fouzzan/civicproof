import { existsSync } from "node:fs";
for (const f of [".env", ".env.local"] as const) if (existsSync(f)) process.loadEnvFile(f);
const { prisma } = await import("../lib/db/index.ts");
const { getCatalogueFingerprint } = await import("../lib/schemes/repository.ts");

try {
  const current = await getCatalogueFingerprint();
  const rows = await prisma.conversation.findMany({
    select: { userId: true, catalogueFingerprint: true, messages: true },
  });
  console.log("current catalogue fingerprint:");
  console.log("  " + current);
  for (const r of rows) {
    const n = Array.isArray(r.messages) ? r.messages.length : 0;
    const stale = r.catalogueFingerprint !== current;
    console.log(`\nuser ${r.userId}`);
    console.log(`  stored fingerprint : ${r.catalogueFingerprint ?? "(null)"}`);
    console.log(`  messages           : ${n}`);
    console.log(`  -> ${stale ? "STALE: will be discarded on their next message" : "current"}`);
  }
} finally {
  await prisma.$disconnect();
}
