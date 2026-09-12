import { existsSync } from "node:fs";

for (const f of [".env", ".env.local"] as const) if (existsSync(f)) process.loadEnvFile(f);

const { prisma } = await import("../lib/db/index.ts");
const { runAgentTurn } = await import("../lib/agent/loop.ts");
const { resetConversation } = await import("../lib/agent/conversation.ts");

/**
 * Malayalam conversational behaviour, end to end.
 *
 * Deliberately few turns: the free tier rate-limits, and a rate-limited turn
 * produces an error card that looks like a failure but is not one, so the
 * script labels that case separately rather than reporting it as a bug.
 *
 *   npx --yes tsx scripts/verify-malayalam-chat.mts
 */
const MALAYALAM = /[ഀ-ൿ]/;

const problems: string[] = [];
let checks = 0;
let rateLimited = 0;

function check(name: string, ok: boolean, detail = "") {
  checks += 1;
  process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) problems.push(name);
}

const IDS = ["ml-jobs", "ml-senior", "ml-farm", "ml-house", "ml-switch"];

async function user(id: string) {
  await prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, email: `${id}@example.invalid`, name: "Malayalam Test" },
  });
  await resetConversation(id);
}

async function say(id: string, text: string) {
  const turn = await runAgentTurn(id, text);
  const limited = /more requests than I can handle/i.test(turn.message);
  if (limited) rateLimited += 1;

  process.stdout.write(
    `\n  > ${text.slice(0, 70)}\n    ${turn.message.slice(0, 150).replace(/\n/g, " ")}…\n` +
      `    cards=[${turn.cards.map((c) => c.kind).join(",") || "none"}]${limited ? "  (RATE LIMITED)" : ""}\n`,
  );

  return { turn, limited };
}

try {
  for (const id of IDS) await user(id);

  // --- 1 + 2 + fact extraction: employment, multi-turn -------------------
  const a1 = await say("ml-jobs", "എനിക്ക് ജോലി അന്വേഷിക്കുകയാണ്. എന്തെങ്കിലും സർക്കാർ സഹായം ലഭിക്കുമോ?");
  if (!a1.limited) {
    check("Malayalam discovery replies in Malayalam", MALAYALAM.test(a1.turn.message));
    check("Malayalam discovery surfaces a service", a1.turn.cards.some((c) => c.kind === "scheme"));
  }

  const a2 = await say("ml-jobs", "എനിക്ക് 30 വയസ്സുണ്ട്. വർഷത്തിൽ ഏകദേശം 90,000 രൂപ വരുമാനം ഉണ്ട്. അതെ, ഞാൻ ജോലി അന്വേഷിക്കുകയാണ്.");
  if (!a2.limited) {
    check("follow-up stays in Malayalam", MALAYALAM.test(a2.turn.message));

    const draft = await prisma.application.findFirst({
      where: { userId: "ml-jobs" },
      select: { collectedFacts: true, scheme: { select: { slug: true } } },
      orderBy: { updatedAt: "desc" },
    });
    const facts = (draft?.collectedFacts ?? {}) as Record<string, unknown>;

    process.stdout.write(`    stored facts: ${JSON.stringify(facts)}\n`);
    check("age extracted as a canonical number", facts.age === 30, String(facts.age));
    check(
      "income extracted as a canonical number",
      typeof facts.annualHouseholdIncome === "number",
      String(facts.annualHouseholdIncome),
    );
    check(
      "Malayalam yes became a real boolean",
      facts.isSeekingWork === true,
      String(facts.isSeekingWork),
    );
  }

  // --- 3, 4, 5: one turn each -------------------------------------------
  const senior = await say("ml-senior", "എനിക്ക് 62 വയസ്സായി. പെൻഷൻ ഒന്നും കിട്ടുന്നില്ല. എന്തെങ്കിലും സഹായം ഉണ്ടോ?");
  if (!senior.limited) {
    check("senior scenario replies in Malayalam", MALAYALAM.test(senior.turn.message));
  }

  const farm = await say("ml-farm", "എനിക്ക് കൃഷിയുണ്ട്. കർഷകർക്ക് എന്തെങ്കിലും സഹായം കിട്ടുമോ?");
  if (!farm.limited) {
    check("agriculture scenario replies in Malayalam", MALAYALAM.test(farm.turn.message));
  }

  const house = await say("ml-house", "എനിക്ക് സ്വന്തമായി വീടില്ല. വീടിന് സർക്കാർ സഹായം ലഭിക്കുമോ?");
  if (!house.limited) {
    check("housing scenario replies in Malayalam", MALAYALAM.test(house.turn.message));
  }

  // --- 9 + 10: switching both ways --------------------------------------
  const s1 = await say("ml-switch", "എനിക്ക് പഠനത്തിന് സഹായം വേണം.");
  if (!s1.limited) check("switch test starts in Malayalam", MALAYALAM.test(s1.turn.message));

  const s2 = await say("ml-switch", "Actually, can you continue in English please?");
  if (!s2.limited) {
    check("Malayalam -> English switch is followed", !MALAYALAM.test(s2.turn.message));
  }

  const s3 = await say("ml-switch", "വീണ്ടും മലയാളത്തിൽ പറയാമോ?");
  if (!s3.limited) {
    check("English -> Malayalam switch is followed", MALAYALAM.test(s3.turn.message));
  }
} catch (error) {
  problems.push(`threw: ${error instanceof Error ? error.message : "unknown"}`);
  process.stdout.write(`\n  THREW: ${error instanceof Error ? error.stack : error}\n`);
} finally {
  await prisma.application.deleteMany({ where: { userId: { in: IDS } } });
  await prisma.conversation.deleteMany({ where: { userId: { in: IDS } } });
  await prisma.user.deleteMany({ where: { id: { in: IDS } } });
  await prisma.$disconnect();
}

process.stdout.write(
  problems.length === 0
    ? `\nAll ${checks} Malayalam chat checks passed.\n`
    : `\n${problems.length} of ${checks} failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\n`,
);
if (rateLimited > 0) {
  process.stdout.write(`${rateLimited} turn(s) were rate-limited (429) — a quota condition, not a code failure.\n`);
}
process.exit(problems.length === 0 ? 0 : 1);
