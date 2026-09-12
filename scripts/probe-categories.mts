import { existsSync } from "node:fs";

for (const f of [".env", ".env.local"] as const) {
  if (existsSync(f)) process.loadEnvFile(f);
}

const { prisma } = await import("../lib/db/index.ts");
const { runAgentTurn } = await import("../lib/agent/loop.ts");
const { resetConversation } = await import("../lib/agent/conversation.ts");

/**
 * One-off probe: does the agent route each situation to the right category?
 *
 * Asserts on model prose, so it is deliberately NOT part of the permanent
 * suite — a flaky test is worse than none. It exists to show the catalogue is
 * genuinely category-agnostic rather than farmer-shaped.
 */
const CASES = [
  { id: "probe-edu", say: "I'm 22, studying in college, and my family income is low.", expect: "Student Education Assistance" },
  { id: "probe-emp", say: "I lost my job recently and have two children.", expect: "Job Seeker Support" },
  { id: "probe-sen", say: "I'm 68 and live alone. I don't get a pension.", expect: "Senior Citizen Assistance" },
  { id: "probe-agri", say: "I'm a farmer with 3 acres and low income.", expect: "Farmer Income Support" },
  { id: "probe-hou", say: "We rent a small place and there are five of us. Money is very tight.", expect: "Basic Housing Assistance" },
  { id: "probe-acc", say: "I use a wheelchair and need help with equipment at home.", expect: "Accessibility Support" },
] as const;

let hits = 0;

try {
  for (const c of CASES) {
    await prisma.user.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, email: `${c.id}@example.invalid`, name: "Probe" },
    });
    await resetConversation(c.id);

    const turn = await runAgentTurn(c.id, c.say);
    const named = turn.message.includes(c.expect);
    const cards = turn.cards.map((x) => x.kind).join(",") || "none";
    if (named) hits += 1;

    process.stdout.write(
      `  [${named ? "HIT " : "MISS"}] ${c.expect.padEnd(30)} cards=[${cards}]\n` +
        `         "${turn.message.slice(0, 120).replace(/\n/g, " ")}…"\n`,
    );
  }
} finally {
  await prisma.application.deleteMany({ where: { userId: { in: CASES.map((c) => c.id) } } });
  await prisma.conversation.deleteMany({ where: { userId: { in: CASES.map((c) => c.id) } } });
  await prisma.user.deleteMany({ where: { id: { in: CASES.map((c) => c.id) } } });
  await prisma.$disconnect();
}

process.stdout.write(`\nRouted correctly: ${hits}/${CASES.length}\n`);
