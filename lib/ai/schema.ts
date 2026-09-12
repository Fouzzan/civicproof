import { Severity } from "@prisma/client";
import { z } from "zod";

/**
 * Schema for the model's response.
 *
 * The AI is treated as an untrusted text generator (Docs/09-AI-DESIGN.md §14):
 * shape, enum values, required fields and maximum lengths are all checked before
 * anything is stored or shown.
 *
 * Severity note: the database enum is LOW | MEDIUM | HIGH | URGENT. Some models
 * emit "CRITICAL" for the top band, so it is accepted as an alias and normalised
 * to URGENT rather than rejecting an otherwise valid analysis.
 */
const SEVERITY_INPUT = ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"] as const;

function normaliseSeverity(value: (typeof SEVERITY_INPUT)[number]): Severity {
  return value === "CRITICAL" ? Severity.URGENT : Severity[value];
}

/** Optional free text: absent, null or empty all mean "nothing to say". */
const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .transform((value) => value.trim())
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional()
    .transform((value) => value ?? null);

export const aiAnalysisResponseSchema = z.object({
  summary: z.string().trim().min(1).max(1500),
  suggestedCategory: z.string().trim().min(1).max(120),
  severity: z.enum(SEVERITY_INPUT).transform(normaliseSeverity),
  severityReason: z.string().trim().min(1).max(1000),
  reportingDirection: z.string().trim().min(1).max(400),
  immediateSafetyGuidance: optionalText(1200),
  potentiallyRelevantRegulatoryContext: optionalText(2000),
});

export type AiAnalysisResult = z.infer<typeof aiAnalysisResponseSchema>;

/**
 * Parse the model's raw text. Models sometimes wrap JSON in prose or a code
 * fence, so the outermost JSON object is extracted before validating.
 */
export function parseAiAnalysis(raw: string): AiAnalysisResult | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end <= start) {
    return null;
  }

  let candidate: unknown;

  try {
    candidate = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }

  const parsed = aiAnalysisResponseSchema.safeParse(candidate);

  return parsed.success ? parsed.data : null;
}
