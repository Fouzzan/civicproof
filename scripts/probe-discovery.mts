import { existsSync } from "node:fs";
for (const f of [".env", ".env.local"] as const) if (existsSync(f)) process.loadEnvFile(f);

const { prisma } = await import("../lib/db/index.ts");
const { runAgentTurn } = await import("../lib/agent/loop.ts");
const { resetConversation } = await import("../lib/agent/conversation.ts");

/** Does a 12-scheme catalogue still produce a usable screen, and can the agent
 *  discriminate between the two schemes inside one category? */
const CASES = [
  { id: "pd-rent", say: "We rent our home, there are five of us, and money is tight.", want: "Basic Housing Assistance" },
  { id: "pd-own", say: "I own my house but it needs urgent repairs and my income is low.", want: "Home Repair Grant" },
] as const;

try {
  for (const c of CASES) {
    await prisma.user.upsert({
      where: { id: c.id }, update: {},
      create: { id: c.id, email: `${c.id}@example.invalid`, name: "Probe" },
    });
    await resetConversation(c.id);

    const turn = await runAgentTurn(c.id, c.say);
    const schemeCard = turn.cards.find((x) => x.kind === "scheme");
    const listed = schemeCard && schemeCard.kind === "scheme" ? schemeCard.schemes.length : 0;
    const named = turn.message.includes(c.want);

    console.log(`\n  ${named ? "HIT " : "MISS"}  "${c.say}"`);
    console.log(`        wanted: ${c.want}`);
    console.log(`        services returned by discovery: ${listed} (UI renders one compact index above 2)`);
    console.log(`        "${turn.message.slice(0, 130).replace(/\n/g, " ")}…"`);
  }
} finally {
  const ids = CASES.map((c) => c.id);
  await prisma.application.deleteMany({ where: { userId: { in: ids } } });
  await prisma.conversation.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
}
