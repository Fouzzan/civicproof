import { z } from "zod";

import { listActiveSchemes } from "@/lib/schemes/repository";
import { SchemeDataError } from "@/lib/schemes/repository";
import { toolError, toolOk, type ToolResult } from "@/lib/tools/types";

/**
 * Tool 1 — SchemeMatcher.
 *
 * Returns the complete, closed set of schemes Sahayak supports.
 *
 * It deliberately does NOT score relevance. With one demonstration scheme, a
 * scoring heuristic could only be arbitrary, and a tool that silently excludes
 * the sole supported scheme is worse than one that lists it. What this tool
 * guarantees is the UNIVERSE: the model can only ever discuss what appears
 * here, which is what makes "never fabricate a scheme" enforceable rather than
 * merely instructed.
 */
export const schemeMatcherInput = z.object({
  situationSummary: z
    .string()
    .min(1)
    .max(1000)
    .describe("One sentence summarising what the citizen said they need help with."),
});

export type SchemeMatcherInput = z.infer<typeof schemeMatcherInput>;

export type MatchedScheme = {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly isDemo: boolean;
  /** Plain-language criteria, so the model can describe the scheme accurately. */
  readonly criteria: readonly string[];
  /**
   * EVERY fact the scheme uses, with its exact id — not only the ones needed
   * for eligibility. The model has to key its tool arguments by these ids, and
   * showing it only half of them is what makes it invent the rest.
   */
  readonly factsNeeded: readonly {
    id: string;
    label: string;
    question: string;
    usedFor: "eligibility" | "application";
  }[];
};

export type SchemeMatcherOutput = {
  readonly supportedSchemes: readonly MatchedScheme[];
  readonly note: string;
};

/**
 * Takes no parameter deliberately.
 *
 * `situationSummary` is still a required argument on the schema above and is
 * still validated by the dispatcher: requiring the model to state the citizen's
 * situation before it may look at any scheme keeps it from reaching for a
 * scheme first and rationalising afterwards. The value itself has no bearing on
 * the closed list this returns, so reading it here would only suggest it does.
 */
export async function runSchemeMatcher(): Promise<ToolResult<SchemeMatcherOutput>> {
  try {
    const schemes = await listActiveSchemes();

    if (schemes.length === 0) {
      return toolError("SCHEME_NOT_FOUND", "No schemes are currently configured.");
    }

    return toolOk({
      supportedSchemes: schemes.map((scheme) => ({
        slug: scheme.slug,
        name: scheme.name,
        summary: scheme.summary,
        isDemo: scheme.isDemo,
        criteria: scheme.rules.map((rule) => rule.label),
        factsNeeded: scheme.facts.map((fact) => ({
          id: fact.id,
          label: fact.label,
          question: fact.question,
          usedFor: fact.forEligibility ? ("eligibility" as const) : ("application" as const),
        })),
      })),
      note:
        "This is the complete list of schemes Sahayak supports. If the citizen needs " +
        "something else, say so plainly instead of describing a scheme that is not listed.",
    });
  } catch (error) {
    if (error instanceof SchemeDataError) {
      return toolError("SCHEME_DATA_ERROR", error.message);
    }

    return toolError("STORAGE_ERROR", "Scheme information is temporarily unavailable.");
  }
}
