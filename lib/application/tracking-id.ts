import { randomInt } from "node:crypto";

/**
 * Citizen-facing reference for a simulated application, e.g. "DEMO-482913".
 *
 * The DEMO- prefix is deliberate and load-bearing: the reference itself says
 * this application exists only in the demonstration system, so a screenshot of
 * it can never be mistaken for a real government receipt.
 *
 * Random rather than sequential, for the same reason as the CivicProof case id:
 * a counter would need state the schema does not have, and COUNT-based ids race
 * under concurrency. Uniqueness is enforced by the column, with a retry.
 *
 * This is an IDENTIFIER, NOT AN AUTHORIZATION TOKEN. Every lookup must still
 * check the owning userId.
 */
export const TRACKING_ID_PATTERN = /^DEMO-\d{6}$/;

export function generateTrackingId(): string {
  return `DEMO-${String(randomInt(0, 1_000_000)).padStart(6, "0")}`;
}

export function isValidTrackingId(value: string): boolean {
  return TRACKING_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normaliseTrackingId(value: string): string {
  return value.trim().toUpperCase();
}
