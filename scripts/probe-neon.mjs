import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

for (const f of [".env", ".env.local"]) if (existsSync(f)) process.loadEnvFile(f);

const cs = process.env.DATABASE_URL ?? "";
console.log("pooled endpoint :", cs.includes("-pooler") ? "yes" : "NO (direct)");
console.log("sslmode         :", /sslmode=([^&]*)/.exec(cs)?.[1] ?? "(unset)");
console.log("connect_timeout :", /connect_timeout=([^&]*)/.exec(cs)?.[1] ?? "(unset)");
console.log("");

for (let i = 1; i <= 4; i++) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: cs }) });
  const t0 = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`  fresh client #${i}: OK   ${Date.now() - t0}ms`);
  } catch (e) {
    console.log(`  fresh client #${i}: FAIL ${Date.now() - t0}ms — ${String(e).split("\n")[0].slice(0, 100)}`);
  } finally {
    await prisma.$disconnect();
  }
}
