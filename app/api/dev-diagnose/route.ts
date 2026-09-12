import { NextResponse } from "next/server";

/**
 * TEMPORARY dev-only diagnostic. Delete after use.
 *
 * Runs the same steps /api/chat runs, inside the real Next.js runtime, and
 * reports which one throws. Returns no secrets and is unreachable in a
 * production build.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const steps: { step: string; ok: boolean; detail?: string }[] = [];

  async function run(step: string, fn: () => Promise<unknown>) {
    try {
      const value = await fn();
      steps.push({ step, ok: true, detail: typeof value === "string" ? value : undefined });
    } catch (error) {
      steps.push({
        step,
        ok: false,
        detail: `${error instanceof Error ? error.name : "unknown"}: ${String(
          error instanceof Error ? error.message : error,
        ).slice(0, 500)}`,
      });
    }
  }

  await run("env: GEMINI_API_KEY present", async () =>
    process.env.GEMINI_API_KEY ? "yes" : "NO",
  );
  await run("env: GEMINI_MODEL", async () => process.env.GEMINI_MODEL ?? "NOT SET");

  await run("prisma: select catalogueFingerprint", async () => {
    const { prisma } = await import("@/lib/db");
    await prisma.conversation.findFirst({ select: { catalogueFingerprint: true } });
    return "ok";
  });

  await run("prisma: scheme count", async () => {
    const { prisma } = await import("@/lib/db");
    return String(await prisma.scheme.count({ where: { isActive: true } }));
  });

  await run("getCatalogueFingerprint()", async () => {
    const { getCatalogueFingerprint } = await import("@/lib/schemes/repository");
    return await getCatalogueFingerprint();
  });

  await run("loadTranscript(throwaway)", async () => {
    const { loadTranscript } = await import("@/lib/agent/conversation");
    const rows = await loadTranscript("dev-diagnose-throwaway");
    return `${rows.length} messages`;
  });

  await run("TOOL_DEFINITIONS built", async () => {
    const { TOOL_DEFINITIONS } = await import("@/lib/tools");
    return `${TOOL_DEFINITIONS.length} tools`;
  });

  await run("gemini: one call (small payload)", async () => {
    const { requestToolCompletion } = await import("@/lib/ai/provider");
    const { TOOL_DEFINITIONS } = await import("@/lib/tools");
    const r = await requestToolCompletion(
      [{ role: "system", content: "You are Sahayak." }, { role: "user", content: "hai" }],
      TOOL_DEFINITIONS,
    );
    return `finish_reason=${r.finishReason}`;
  });

  // RAW call with the REAL payload: full system prompt + all five tools + the
  // message that fails in the browser. The provider wrapper collapses every
  // non-429 failure into PROVIDER_ERROR and discards the status, so this goes
  // straight to fetch to capture what Gemini actually said.
  await run("gemini: RAW call with the real chat payload", async () => {
    const { SAHAYAK_SYSTEM_PROMPT } = await import("@/lib/agent/prompt");
    const { TOOL_DEFINITIONS } = await import("@/lib/tools");
    const { getAiConfig } = await import("@/lib/ai/config");

    const config = getAiConfig();
    if (!config) return "NOT CONFIGURED";

    const started = Date.now();
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: SAHAYAK_SYSTEM_PROMPT },
          {
            role: "user",
            content: "I am a farmer and my income is low. Is there any support I can get?",
          },
        ],
        tools: TOOL_DEFINITIONS,
        tool_choice: "auto",
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    const text = await response.text();
    const elapsed = Date.now() - started;

    // Status plus a bounded slice of the body. The body echoes only our own
    // prompt back on error, and the key is never in it.
    return `HTTP ${response.status} in ${elapsed}ms :: ${text.slice(0, 900)}`;
  });

  // Through the provider wrapper, WITH the real stored history — the exact call
  // the browser makes. AiProviderError.message carries the HTTP status, which
  // is the one fact the user-facing mapping throws away.
  await run("provider wrapper + real history", async () => {
    const { prisma } = await import("@/lib/db");
    const { requestToolCompletion, AiProviderError } = await import("@/lib/ai/provider");
    const { SAHAYAK_SYSTEM_PROMPT } = await import("@/lib/agent/prompt");
    const { TOOL_DEFINITIONS } = await import("@/lib/tools");

    const row = await prisma.conversation.findFirst({
      where: { userId: { startsWith: "user_" } },
      orderBy: { updatedAt: "desc" },
    });
    const history = (Array.isArray(row?.messages) ? row.messages : []) as never[];

    try {
      const r = await requestToolCompletion(
        [
          { role: "system", content: SAHAYAK_SYSTEM_PROMPT },
          ...history,
          {
            role: "user",
            content: "I am a farmer and my income is low. Is there any support I can get?",
          },
        ],
        TOOL_DEFINITIONS,
      );
      return `OK finish_reason=${r.finishReason} (history=${history.length})`;
    } catch (error) {
      if (error instanceof AiProviderError) {
        throw new Error(`AiProviderError reason=${error.reason} message="${error.message}"`);
      }
      throw error;
    }
  });

  // The whole turn, as the browser runs it.
  await run("runAgentTurn with the real user", async () => {
    const { prisma } = await import("@/lib/db");
    const { runAgentTurn } = await import("@/lib/agent/loop");

    const row = await prisma.conversation.findFirst({
      where: { userId: { startsWith: "user_" } },
      orderBy: { updatedAt: "desc" },
    });
    if (!row) return "no real user conversation found";

    const turn = await runAgentTurn(
      row.userId,
      "I am a farmer and my income is low. Is there any support I can get?",
    );
    return `cards=[${turn.cards.map((c) => c.kind).join(",") || "none"}] msg="${turn.message.slice(0, 120)}"`;
  });

  return NextResponse.json({ steps });
}
