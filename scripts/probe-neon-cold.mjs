import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

for (const f of [".env", ".env.local"]) if (existsSync(f)) process.loadEnvFile(f);
const cs = process.env.DATABASE_URL ?? "";

// Neon free tier suspends compute after ~5 minutes idle. Wait past that, then
// measure what the FIRST connection actually does — which is what a judge hits
// if the laptop has been sitting on the slide deck.
const IDLE_MS = 9 * 60 * 1000;
console.log(`[${new Date().toISOString()}] idling ${IDLE_MS / 1000}s to let Neon suspend (NO other DB traffic must occur)…`);
await new Promise((r) => setTimeout(r, IDLE_MS));

for (let i = 1; i <= 3; i++) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: cs }) });
  const t0 = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`[${new Date().toISOString()}] attempt #${i}: OK   ${Date.now() - t0}ms`);
  } catch (e) {
    console.log(`[${new Date().toISOString()}] attempt #${i}: FAIL ${Date.now() - t0}ms — ${String(e).split("\n")[0].slice(0, 120)}`);
  } finally {
    await prisma.$disconnect();
  }
}
