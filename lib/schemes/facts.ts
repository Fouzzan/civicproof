import type { CollectedFacts, FactValue, SchemeDefinition, SchemeFact } from "@/lib/schemes/types";

/**
 * Normalising facts arriving from the model.
 *
 * The model extracts facts from free text, so it may hand back "62", "sixty
 * two", "yes" or 62 for the same answer. This module converts what it can and
 * REJECTS what it cannot, rather than guessing.
 *
 * Rejecting matters more than converting: a fact that silently becomes the
 * wrong value produces a confident, wrong eligibility answer, which is the one
 * failure mode the deterministic checker exists to prevent.
 */

const TRUE_WORDS = new Set(["true", "yes", "y", "haan", "haa", "1"]);
const FALSE_WORDS = new Set(["false", "no", "n", "nahi", "0"]);

export type FactRejection = {
  readonly factId: string;
  readonly reason: string;
};

export type NormalisedFacts = {
  readonly accepted: CollectedFacts;
  readonly rejected: readonly FactRejection[];
};

function normaliseNumber(fact: SchemeFact, raw: unknown): number | FactRejection {
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw.replace(/[,\s₹]/g, ""))
        : Number.NaN;

  if (!Number.isFinite(value)) {
    return { factId: fact.id, reason: `"${fact.label}" must be a number.` };
  }

  if (fact.min !== undefined && value < fact.min) {
    return { factId: fact.id, reason: `"${fact.label}" cannot be less than ${fact.min}.` };
  }

  if (fact.max !== undefined && value > fact.max) {
    return { factId: fact.id, reason: `"${fact.label}" cannot be more than ${fact.max}.` };
  }

  return value;
}

function normaliseBoolean(fact: SchemeFact, raw: unknown): boolean | FactRejection {
  if (typeof raw === "boolean") {
    return raw;
  }

  if (typeof raw === "string") {
    const word = raw.trim().toLowerCase();

    if (TRUE_WORDS.has(word)) return true;
    if (FALSE_WORDS.has(word)) return false;
  }

  return { factId: fact.id, reason: `"${fact.label}" must be yes or no.` };
}

function normaliseText(fact: SchemeFact, raw: unknown): string | FactRejection {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { factId: fact.id, reason: `"${fact.label}" must be text.` };
  }

  // Bounded so a long paste cannot bloat a stored application.
  return raw.trim().slice(0, 200);
}

function isRejection(value: FactValue | FactRejection): value is FactRejection {
  return typeof value === "object" && value !== null && "reason" in value;
}

/**
 * Convert raw model output into typed facts this scheme recognises.
 *
 * Facts the scheme does not define are dropped, not stored: the model does not
 * get to invent new fields on an application.
 */
export function normaliseFacts(
  scheme: SchemeDefinition,
  raw: Readonly<Record<string, unknown>>,
): NormalisedFacts {
  const accepted: Record<string, FactValue> = {};
  const rejected: FactRejection[] = [];

  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null) {
      continue;
    }

    const fact = scheme.facts.find((candidate) => candidate.id === key);

    // An unknown key is reported, never silently dropped. The model routinely
    // guesses a plausible id ("name" for "fullName"), and swallowing that loses
    // something the citizen actually said — they then get asked for it again,
    // which reads as not listening. Naming the valid ids lets the model correct
    // itself on the next turn.
    if (!fact) {
      rejected.push({
        factId: key,
        reason: `There is no field called "${key}". The fields for this scheme are: ${scheme.facts
          .map((candidate) => candidate.id)
          .join(", ")}.`,
      });
      continue;
    }

    const normalised =
      fact.kind === "number"
        ? normaliseNumber(fact, value)
        : fact.kind === "boolean"
          ? normaliseBoolean(fact, value)
          : normaliseText(fact, value);

    if (isRejection(normalised)) {
      rejected.push(normalised);
    } else {
      accepted[key] = normalised;
    }
  }

  return { accepted, rejected };
}

/**
 * Merge new facts over old ones.
 *
 * Later values win, which is how a correction takes effect. Nothing is ever
 * merged the other way round: a stored value must never quietly overwrite what
 * the citizen just told us (Docs/09-AI-DESIGN.md, safety rules 5 and 6).
 */
export function mergeFacts(existing: CollectedFacts, incoming: CollectedFacts): CollectedFacts {
  return { ...existing, ...incoming };
}
