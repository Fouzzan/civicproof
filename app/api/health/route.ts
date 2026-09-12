import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/api/rate-limit";
import { prisma } from "@/lib/db";

/**
 * GET /api/health — wake the database.
 *
 * Neon's free tier suspends compute after a few minutes idle, and the FIRST
 * connection afterwards fails outright rather than waiting for the wake-up.
 * Measured here: a warm connect is ~0.4-0.8s, a cold one errors immediately and
 * the next attempt succeeds.
 *
 * The browser calls this as the chat mounts, so the database wakes while the
 * citizen is still reading the welcome screen rather than in the middle of
 * their first question.
 *
 * One retry, because that is exactly what the failure needs — the first attempt
 * is what triggers the wake-up, and the second finds it awake.
 *
 * Unauthenticated on purpose: it must also warm the database for a signed-out
 * visitor, before Clerk has resolved. It runs a single `SELECT 1`, returns no
 * data, and is rate-limited.
 */
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

async function ping(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  // A shared key: this is a stampede guard for a public endpoint, not a
  // per-user quota.
  const limit = checkRateLimit("health", RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

  if (!limit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const first = await ping();
  const ok = first || (await ping());

  // 200 either way: this is a warm-up hint, not a readiness probe, and a
  // failure here must not make the page look broken.
  return NextResponse.json({ ok, database: ok ? "awake" : "unavailable" });
}
