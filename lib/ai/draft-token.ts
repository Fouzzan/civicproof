import { createHmac, timingSafeEqual } from "node:crypto";

import type { AiAnalysisResult } from "@/lib/ai/schema";

/**
 * Tamper-evident token binding an AI analysis to the report it came from.
 *
 * The analysis is produced before any Case exists, so it has to travel through
 * the browser to reach the save request. Without protection a citizen could edit
 * the severity and have CivicProof store user-authored text labelled as model
 * output — a lie in the database, and Case.severity is shown to authorities.
 *
 * So the server signs what it generated. At save time the signature is
 * recomputed over the analysis and the report it was derived from; if either was
 * altered, verification fails and the case is saved without an analysis rather
 * than with a forged one.
 *
 * Stateless by design: nothing is cached server-side, so this behaves correctly
 * across serverless instances.
 */
const DOMAIN = "civicproof.draft-analysis.v1";
const TOKEN_TTL_MS = 60 * 60 * 1000;

function signingSecret(): string {
  // A dedicated secret if configured; otherwise derive from an existing
  // server-only secret so there is no new required env var to forget in
  // deployment. The domain label keeps this use separate from authentication.
  const secret = process.env.DRAFT_SIGNING_SECRET ?? process.env.CLERK_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "No signing secret available: set DRAFT_SIGNING_SECRET or CLERK_SECRET_KEY.",
    );
  }

  return secret;
}

/**
 * Canonical serialisation. Key order must not depend on object construction, or
 * an identical analysis could produce a different signature.
 */
function canonicalise(analysis: AiAnalysisResult): string {
  return JSON.stringify([
    analysis.summary,
    analysis.suggestedCategory,
    analysis.severity,
    analysis.severityReason,
    analysis.reportingDirection,
    analysis.immediateSafetyGuidance,
    analysis.potentiallyRelevantRegulatoryContext,
  ]);
}

function digest(
  analysis: AiAnalysisResult,
  reportFingerprint: string,
  userId: string,
  expiresAt: number,
): string {
  return createHmac("sha256", signingSecret())
    .update(DOMAIN)
    .update("\u0000")
    .update(userId)
    .update("\u0000")
    .update(reportFingerprint)
    .update("\u0000")
    .update(canonicalise(analysis))
    .update("\u0000")
    .update(String(expiresAt))
    .digest("base64url");
}

/**
 * Fingerprint of the report the analysis describes. Binding to this means an
 * analysis cannot be lifted onto a different report.
 */
export function fingerprintReport(parts: {
  readonly incidentType: string;
  readonly description: string;
  readonly location?: string | null;
}): string {
  return createHmac("sha256", signingSecret())
    .update(DOMAIN)
    .update("\u0000")
    .update(parts.incidentType)
    .update("\u0000")
    .update(parts.description.trim())
    .update("\u0000")
    .update(parts.location?.trim() ?? "")
    .digest("base64url");
}


function encodePart(value: string): string {
  return encodeURIComponent(value).replace(/\./g, "%2E");
}

function decodePart(value: string): string {
  return decodeURIComponent(value);
}

export function signAnalysis(
  analysis: AiAnalysisResult,
  reportFingerprint: string,
  userId: string,
  modelLabel: string,
): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const signature = digest(analysis, reportFingerprint, userId, expiresAt);

  // Dots separate the fields, so any dot inside a field must be escaped —
  // model labels such as "gemini-3.1-flash-lite" contain them, and an
  // unescaped one would split into the wrong number of parts.
  return [String(expiresAt), modelLabel, signature].map(encodePart).join(".");
}

/**
 * Returns the model label the analysis was produced with, or null when the
 * token is missing, malformed, expired, or does not match this exact analysis
 * and report. Callers treat null as "no verified analysis".
 */
export function verifyAnalysis(
  token: string,
  analysis: AiAnalysisResult,
  reportFingerprint: string,
  userId: string,
): string | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [rawExpiry, rawModel, rawSignature] = parts.map(decodePart);
  const expiresAt = Number(rawExpiry);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  const expected = Buffer.from(digest(analysis, reportFingerprint, userId, expiresAt));
  const provided = Buffer.from(rawSignature);

  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return null;
  }

  return rawModel;
}
