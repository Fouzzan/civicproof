import { NextResponse } from "next/server";
import { z } from "zod";

import { runAgentTurn } from "@/lib/agent/loop";
import { resetConversation } from "@/lib/agent/conversation";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth";

/**
 * POST /api/chat — the single conversational backend for Sahayak.
 *
 * Thin by design: authenticate, rate-limit, validate, delegate. All reasoning
 * lives in lib/agent and all data access in lib/tools, so this file never
 * touches Prisma and the browser never learns anything about the model.
 */

// A conversation turn is cheap for the citizen and expensive for us, so the
// window is generous enough for a real conversation and tight enough to stop a
// runaway client burning the free-tier quota.
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Type a message first.").max(2000),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    const limit = checkRateLimit(`chat:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "You are sending messages very quickly. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "That message could not be read." },
        { status: 400 },
      );
    }

    const turn = await runAgentTurn(user.id, parsed.data.message);

    // `debug` carries the provider's actual failure reason and is forwarded
    // only outside production, where it lands in the browser's network tab.
    // The citizen-facing message and cards are identical either way.
    return NextResponse.json({
      message: turn.message,
      cards: turn.cards,
      ...(process.env.NODE_ENV !== "production" && turn.debug
        ? { debug: turn.debug }
        : {}),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    // Never surface the underlying reason: it can carry prompt or provider
    // detail the browser has no business seeing.
    return NextResponse.json(
      { error: "Sahayak is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}

/** DELETE /api/chat — start the conversation over. */
export async function DELETE() {
  try {
    const user = await requireAuthenticatedUser();
    await resetConversation(user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not reset the conversation." }, { status: 500 });
  }
}
