import { getModelLabel } from "@/lib/ai/config";
import { buildCaseAnalysisMessages, type CaseAnalysisInput } from "@/lib/ai/prompt";
import { AiProviderError, requestJsonCompletion } from "@/lib/ai/provider";
import { parseAiAnalysis, type AiAnalysisResult } from "@/lib/ai/schema";

export type AnalysisOutcome = {
  readonly result: AiAnalysisResult;
  readonly modelLabel: string;
};

/**
 * Run one bounded AI operation: describe a report.
 *
 * No tools, no planning loop, no follow-up calls — a single request whose output
 * is validated before the caller may use it (Docs/09-AI-DESIGN.md §8).
 */
export async function analyseCase(input: CaseAnalysisInput): Promise<AnalysisOutcome> {
  const { content, config } = await requestJsonCompletion(
    buildCaseAnalysisMessages(input),
  );

  const result = parseAiAnalysis(content);

  if (!result) {
    // The raw content is deliberately not logged: it can restate the report.
    throw new AiProviderError(
      "EMPTY_RESPONSE",
      "AI response did not match the expected structure.",
    );
  }

  return { result, modelLabel: getModelLabel(config) };
}
