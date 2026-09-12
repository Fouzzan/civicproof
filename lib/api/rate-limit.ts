/**
 * Minimal in-process sliding-window rate limiter.
 *
 * Docs/13-SECURITY.md §12 calls for basic abuse protection and explicitly says a
 * lightweight limiter is enough for the hackathon; a distributed one is
 * unnecessary. Caveat worth knowing: this counts per server instance, so on
 * serverless the effective limit is per warm instance, not global. It is a guard
 * against runaway loops and double submissions, not a hard security boundary.
 */
type Window = { readonly hits: readonly number[] };

const windows = new Map<string, Window>();

export type RateLimitResult = {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  maxHits: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;
  const previous = windows.get(key)?.hits ?? [];
  const recent = previous.filter((timestamp) => timestamp > cutoff);

  if (recent.length >= maxHits) {
    const oldest = recent[0] ?? now;

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  windows.set(key, { hits: [...recent, now] });

  return { allowed: true, retryAfterSeconds: 0 };
}
