import { existsSync } from "node:fs";

for (const f of [".env", ".env.local"] as const) {
  if (existsSync(f)) process.loadEnvFile(f);
}

const { prisma } = await import("../lib/db/index.ts");
const { runAgentTurn } = await import("../lib/agent/loop.ts");
const { loadTranscript } = await import("../lib/agent/conversation.ts");

/**
 * Regression guard for the stale-catalogue bug.
 *
 * A conversation started before the catalogue grew from one scheme to six kept
 * insisting only the original scheme existed — the model was answering from
 * cached tool results in its own transcript rather than calling the tool again.
 * Every other script resets the conversation first, so none of them could see
 * it. This one deliberately does NOT reset: it plants a stale transcript and
 * checks the agent recovers.
 *
 *   npx --yes tsx scripts/verify-stale-catalogue.mts
 */
const USER = "verify-stale-user";
const problems: string[] = [];
let checks = 0;

function check(name: string, ok: boolean, detail = "") {
  checks += 1;
  process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) problems.push(name);
}

/** A transcript exactly like the one that caused the regression. */
const STALE_TRANSCRIPT = [
  { role: "user", content: "I need some government help." },
  {
    role: "assistant",
    content:
      "This demo only supports the Demo Farmer Income Support scheme, and I do not have information on any other programs or scholarships.",
  },
];

async function cleanup() {
  await prisma.application.deleteMany({ where: { userId: USER } });
  await prisma.conversation.deleteMany({ where: { userId: USER } });
  await prisma.user.deleteMany({ where: { id: USER } });
}

try {
  await cleanup();
  await prisma.user.upsert({
    where: { id: USER },
    update: {},
    create: { id: USER, email: `${USER}@example.invalid`, name: "Stale User" },
  });

  // Plant a pre-Phase-1 transcript: farmer-only, and fingerprinted against the
  // catalogue as it was when only that one scheme existed.
  await prisma.conversation.create({
    data: {
      userId: USER,
      messages: STALE_TRANSCRIPT,
      catalogueFingerprint: "demo-farmer-income-support",
    },
  });

  const beforeRow = await prisma.conversation.findUnique({ where: { userId: USER } });
  check(
    "a stale transcript is present before the turn",
    Array.isArray(beforeRow?.messages) && (beforeRow.messages as unknown[]).length === 2,
  );

  // Loading it must discard it, because the catalogue has changed since.
  const loaded = await loadTranscript(USER);
  check("loadTranscript discards a transcript from a different catalogue", loaded.length === 0);

  const afterRow = await prisma.conversation.findUnique({ where: { userId: USER } });
  check(
    "the stored fingerprint is refreshed to the current catalogue",
    (afterRow?.catalogueFingerprint ?? "").split(",").length === 6,
    afterRow?.catalogueFingerprint ?? "(null)",
  );

  // The real symptom: the exact message the citizen sent.
  const turn = await runAgentTurn(USER, "can i enquire about scholarships");
  const said = turn.message;
  const kinds = turn.cards.map((c) => c.kind).join(",") || "none";

  process.stdout.write(`\n  agent: "${said.slice(0, 200).replace(/\n/g, " ")}…"\n  cards: [${kinds}]\n\n`);

  check(
    'the agent no longer claims only the farmer scheme exists',
    !/only support/i.test(said) && !said.includes("Demo Farmer Income Support"),
  );
  check(
    "education support is surfaced for a scholarship question",
    said.includes("Student Education Assistance") ||
      turn.cards.some(
        (c) =>
          c.kind === "scheme" &&
          c.schemes.some((s) => s.slug === "student-education-assistance"),
      ),
  );
  check("a scheme card is returned", turn.cards.some((c) => c.kind === "scheme"));
} catch (error) {
  problems.push(`threw: ${error instanceof Error ? error.message : "unknown"}`);
  process.stdout.write(`\n  THREW: ${error instanceof Error ? error.stack : error}\n`);
} finally {
  await cleanup();
  await prisma.$disconnect();
}

process.stdout.write(
  problems.length === 0
    ? `\nAll ${checks} stale-catalogue checks passed.\n`
    : `\n${problems.length} of ${checks} failed.\n`,
);
process.exit(problems.length === 0 ? 0 : 1);
