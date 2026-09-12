import type { AgentCard } from "@/lib/agent/cards";
import { loadTranscript, saveTranscript } from "@/lib/agent/conversation";
import { SAHAYAK_SYSTEM_PROMPT } from "@/lib/agent/prompt";
import {
  AiProviderError,
  requestToolCompletion,
  type AgentMessage,
  type ToolCall,
} from "@/lib/ai/provider";
import type { ApplicationSubmitterOutput } from "@/lib/tools/application-submitter";
import type { EligibilityCheckerOutput } from "@/lib/tools/eligibility-checker";
import type { FormFillerOutput } from "@/lib/tools/form-filler";
import type { SchemeMatcherOutput } from "@/lib/tools/scheme-matcher";
import type { StatusTrackerOutput } from "@/lib/tools/status-tracker";
import { executeTool, TOOL_DEFINITIONS } from "@/lib/tools";
import type { ToolResult } from "@/lib/tools/types";

/**
 * The Sahayak agent loop.
 *
 * Bounded by construction: at most MAX_ITERATIONS model calls per user message,
 * with no path that extends the budget. A model that keeps asking for tools
 * simply runs out of turns and the citizen gets an honest fallback, which is
 * strictly better than a loop that can spin against a metered API.
 *
 * The cards returned to the browser are derived from tool RESULTS, not from the
 * model's prose. If the model claims an application was submitted but
 * submit_application never succeeded, no submission card exists and there is
 * nothing on screen to corroborate the claim.
 */

/** Enough for match -> check -> prepare plus a retry, and no more. */
export const MAX_ITERATIONS = 6;

export type AgentTurn = {
  readonly message: string;
  readonly cards: readonly AgentCard[];
  readonly iterations: number;
  /**
   * The underlying failure reason, for developers only.
   *
   * The citizen-facing message is deliberately generic, which left an
   * intermittent provider fault undiagnosable: the HTTP status was known here
   * and then discarded, so two separate investigations had nothing to work
   * from. This carries it as far as the route, which forwards it ONLY outside
   * production.
   */
  readonly debug?: string;
};

type ToolOutcome = { readonly name: string; readonly result: ToolResult<unknown> };

const FALLBACK_MESSAGE =
  "Sorry — I lost my thread there. Could you tell me again what you need help with?";

/**
 * Build this turn's cards from what the tools actually returned.
 *
 * Only the most recent card of each kind survives: an eligibility card from
 * before a correction is superseded by the one computed after it, and showing
 * both would let the citizen act on a stale result.
 */
function deriveCards(outcomes: readonly ToolOutcome[]): readonly AgentCard[] {
  const byKind = new Map<string, AgentCard>();

  for (const outcome of outcomes) {
    if (!outcome.result.ok) {
      continue;
    }

    switch (outcome.name) {
      case "match_schemes": {
        const data = outcome.result.data as SchemeMatcherOutput;

        byKind.set("scheme", {
          kind: "scheme",
          schemes: data.supportedSchemes.map((scheme) => ({
            slug: scheme.slug,
            name: scheme.name,
            summary: scheme.summary,
            isDemo: scheme.isDemo,
            criteria: scheme.criteria,
          })),
        });
        break;
      }

      case "check_eligibility": {
        const { result } = outcome.result.data as EligibilityCheckerOutput;

        byKind.delete("scheme");
        byKind.set("eligibility", {
          kind: "eligibility",
          eligibility: {
            outcome: result.outcome,
            schemeName: result.schemeName,
            isDemo: result.isDemo,
            criteria: result.criteria.map((criterion) => ({
              id: criterion.id,
              label: criterion.label,
              status: criterion.status,
              failureHint: criterion.failureHint,
            })),
          },
        });
        break;
      }

      case "prepare_application": {
        const data = outcome.result.data as FormFillerOutput;

        byKind.set("application", {
          kind: "application",
          application: {
            applicationId: data.applicationId,
            schemeName: data.schemeName,
            isDemo: data.isDemo,
            fields: data.fields,
            readyToConfirm: data.readyToConfirm,
          },
        });
        break;
      }

      case "submit_application": {
        const data = outcome.result.data as ApplicationSubmitterOutput;

        byKind.set("submission", { kind: "submission", submission: data });
        // A submitted application is no longer a draft awaiting confirmation.
        byKind.delete("application");
        break;
      }

      case "get_application_status": {
        const data = outcome.result.data as StatusTrackerOutput;

        byKind.set("status", { kind: "status", status: data });
        break;
      }
    }
  }

  return [...byKind.values()];
}

/**
 * Run one tool call.
 *
 * There is deliberately NO "did it just prepare?" guard here.
 *
 * Automatic submission is already impossible in the data model: a freshly
 * prepared draft has `confirmedAt = null`, preparing again with changed facts
 * clears it (lib/tools/form-filler.ts), and submitApplication re-reads the
 * column inside its own transaction. An agent that prepares and immediately
 * submits gets CONFIRMATION_REQUIRED every time.
 *
 * An earlier version of this function also blocked submit whenever prepare had
 * run in the same turn. It added no guarantee the column does not already give,
 * and it broke a legitimate sequence: a citizen who has confirmed, then asks to
 * submit, gets the draft re-shown and then submitted in one turn. That is
 * correct behaviour and the guard was rejecting it.
 */
async function runToolCall(call: ToolCall, userId: string): Promise<ToolResult<unknown>> {
  return executeTool(call.function.name, call.function.arguments, { userId });
}

function messageFrom(error: unknown): string {
  if (!(error instanceof AiProviderError)) {
    return "Something went wrong on my side. Your answers are safe — please try again.";
  }

  switch (error.reason) {
    case "NOT_CONFIGURED":
      return "Sahayak's assistant is not configured right now, so I cannot help with this yet.";
    case "RATE_LIMITED":
      return "I am getting more requests than I can handle. Please wait a moment and try again.";
    case "TIMEOUT":
      return "That took too long to think about. Please try again.";
    default:
      return "I could not reach my assistant just now. Your answers are safe — please try again.";
  }
}

export async function runAgentTurn(userId: string, userMessage: string): Promise<AgentTurn> {
  const messages: AgentMessage[] = [];
  const outcomes: ToolOutcome[] = [];
  let finalText = "";
  let iterations = 0;

  try {
    // Inside the try deliberately. Loading the transcript touches the database,
    // and when it threw from outside this block the exception escaped to the
    // route's generic 500 — the citizen got "Sahayak is temporarily
    // unavailable" with no card, no explanation and nothing in the response to
    // diagnose from. Every failure in this function should degrade to an error
    // card, not a blank 500.
    const history = await loadTranscript(userId);
    messages.push(...history, { role: "user", content: userMessage });

    for (let step = 0; step < MAX_ITERATIONS; step += 1) {
      iterations = step + 1;

      const completion = await requestToolCompletion(
        [{ role: "system", content: SAHAYAK_SYSTEM_PROMPT }, ...messages],
        TOOL_DEFINITIONS,
      );

      // Echoed back verbatim so Gemini's thought signature survives the turn.
      messages.push(completion.message);

      const calls = completion.message.tool_calls ?? [];

      if (calls.length === 0) {
        finalText = (completion.message.content ?? "").trim();
        break;
      }

      for (const call of calls) {
        const result = await runToolCall(call, userId);
        outcomes.push({ name: call.function.name, result });

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }
  } catch (error) {
    // The transcript is still saved: the citizen's message and any tool work
    // already done should survive a provider failure.
    const text = messageFrom(error);
    await saveTranscript(userId, messages).catch(() => undefined);

    return {
      message: text,
      cards: [{ kind: "error", message: text }, ...deriveCards(outcomes)],
      iterations,
      debug:
        error instanceof AiProviderError
          ? `${error.reason}: ${error.message}`
          : `${error instanceof Error ? error.name : "unknown"}: ${
              error instanceof Error ? error.message : String(error)
            }`,
    };
  }

  await saveTranscript(userId, messages);

  const cards = deriveCards(outcomes);

  // Running out of iterations is not the citizen's fault, and it must not be
  // dressed up as an answer.
  if (finalText.length === 0) {
    return {
      message: cards.length > 0 ? "Here is what I found." : FALLBACK_MESSAGE,
      cards,
      iterations,
    };
  }

  return { message: finalText, cards, iterations };
}
