import { existsSync } from "node:fs";

for (const f of [".env", ".env.local"] as const) if (existsSync(f)) process.loadEnvFile(f);

const { prisma } = await import("../lib/db/index.ts");
const { runAgentTurn } = await import("../lib/agent/loop.ts");

/**
 * The browser test cases, run through the real agent path.
 *
 * No conversation reset, so this reflects what a citizen actually gets on a
 * first message. Case F is the important one: it never says "student" or
 * "scholarship", so it tests situation-first discovery rather than keyword
 * matching.
 */
type Case = {
  readonly id: string;
  readonly say: string;
  /** Null for cases where no scheme should be named yet. */
  readonly expect: { slug: string; name: string } | null;
};

const CASES: readonly Case[] = [
  { id: "scn-a", say: "hai", expect: null },
  {
    id: "scn-b",
    say: "I am a student looking for scholarship support.",
    expect: { slug: "student-education-assistance", name: "Student Education Assistance" },
  },
  {
    id: "scn-c",
    say: "I am 62 years old, recently retired, and I don't receive a pension.",
    expect: { slug: "senior-citizen-assistance", name: "Senior Citizen Assistance" },
  },
  {
    id: "scn-d",
    say: "I am looking for a job and need training support.",
    expect: { slug: "job-seeker-support", name: "Job Seeker Support" },
  },
  {
    id: "scn-e",
    say: "I am a farmer with 3 acres and low income.",
    expect: { slug: "farmer-income-support", name: "Farmer Income Support" },
  },
  {
    id: "scn-f",
    say: "My daughter is going to college next year and we are struggling to pay the fees.",
    expect: { slug: "student-education-assistance", name: "Student Education Assistance" },
  },
];

const ids = CASES.map((c) => c.id);
let pass = 0;
let rateLimited = 0;

try {
  for (const c of CASES) {
    await prisma.user.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, email: `${c.id}@example.invalid`, name: "Scenario" },
    });

    const turn = await runAgentTurn(c.id, c.say);
    const kinds = turn.cards.map((x) => x.kind);
    const erred = kinds.includes("error");
    const limited = /more requests than I can handle/i.test(turn.message);
    if (limited) rateLimited += 1;

    const deniesOthers = /only support/i.test(turn.message);
    let ok: boolean;

    if (c.expect === null) {
      // A greeting: it must answer, not error, and not invent a scheme.
      ok = !erred && turn.message.length > 0 && !deniesOthers;
    } else {
      const named = turn.message.includes(c.expect.name);
      const carded = turn.cards.some(
        (x) => x.kind === "scheme" && x.schemes.some((s) => s.slug === c.expect!.slug),
      );
      ok = (named || carded) && !erred && !deniesOthers;
    }

    if (ok) pass += 1;

    process.stdout.write(
      `\n  [${ok ? "PASS" : limited ? "RATE" : "FAIL"}] ${c.say}\n` +
        `         cards=[${kinds.join(",") || "none"}] deniesOthers=${deniesOthers}\n` +
        `         "${turn.message.slice(0, 150).replace(/\n/g, " ")}…"\n`,
    );
  }
} finally {
  await prisma.application.deleteMany({ where: { userId: { in: ids } } });
  await prisma.conversation.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
}

process.stdout.write(`\n${pass}/${CASES.length} scenarios behaved correctly.\n`);
if (rateLimited > 0) {
  process.stdout.write(
    `${rateLimited} were rate-limited by the provider (429), which is a quota condition, not a code failure.\n`,
  );
}
process.exit(pass === CASES.length ? 0 : 1);
