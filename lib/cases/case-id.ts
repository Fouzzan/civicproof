import { randomInt } from "node:crypto";

/**
 * Citizen-facing case reference, e.g. "CP-2026-000184".
 *
 * The numeric part is random rather than sequential. A sequence would need a
 * counter the five-model schema does not have, and a COUNT-based approach races
 * under concurrency. Randomness plus the unique constraint on Case.caseId and a
 * retry loop gives the same visible format with no extra state.
 *
 * This is an IDENTIFIER, NOT A SECRET and NOT AN AUTHORIZATION TOKEN. Every read
 * must still check reporterId / authorityUserId (Docs/13-SECURITY.md §3).
 */
export const CASE_ID_PATTERN = /^CP-\d{4}-\d{6}$/;

export function generateCaseId(now: Date = new Date()): string {
  const sequence = String(randomInt(0, 1_000_000)).padStart(6, "0");

  return `CP-${now.getFullYear()}-${sequence}`;
}

export function isValidCaseId(value: string): boolean {
  return CASE_ID_PATTERN.test(value);
}
