import { Check, Circle, Loader2, Sparkles } from "lucide-react";
import { cn } from "cn";

import type { AgentCard } from "@/lib/agent/cards";

/**
 * What Sahayak is doing, at a level a citizen can safely be shown.
 *
 * Each stage is marked from TOOL RESULTS that actually came back — a scheme
 * card means discovery ran, an eligibility card means the rules were evaluated.
 * Nothing here reports the model's reasoning, and nothing is shown as done
 * because the model claimed it was.
 *
 * This is an activity summary, deliberately not chain-of-thought: the stage
 * names are fixed strings chosen in advance, so no internal deliberation can
 * reach the screen through them.
 */
export type ActivityStage = "done" | "active" | "pending";

const STAGES = [
  "Understanding your situation",
  "Finding relevant services",
  "Checking eligibility",
  "Preparing application",
  "Tracking",
] as const;

/**
 * Derive how far the journey has actually progressed.
 *
 * `busy` marks the next unfinished stage as in-flight, which is the only part
 * that is a guess — and it is a guess about our own UI, not about the model.
 */
export function deriveStages(
  cards: readonly AgentCard[],
  hasConversation: boolean,
  busy: boolean,
): readonly ActivityStage[] {
  const kinds = new Set(cards.map((card) => card.kind));

  const reached = [
    hasConversation,
    kinds.has("scheme") || kinds.has("eligibility") || kinds.has("application"),
    kinds.has("eligibility") || kinds.has("application") || kinds.has("submission"),
    kinds.has("application") || kinds.has("submission"),
    kinds.has("submission") || kinds.has("status"),
  ];

  const stages: ActivityStage[] = reached.map((done) => (done ? "done" : "pending"));
  const next = stages.indexOf("pending");

  if (busy && next !== -1) {
    stages[next] = "active";
  }

  return stages;
}

export function AgentActivity({
  stages,
  className,
  compactOnMobile = false,
}: {
  readonly stages: readonly ActivityStage[];
  readonly className?: string;
  /**
   * In the chat the panel sits above the transcript, where five lines would eat
   * most of a phone screen. Collapsed to one line there and shown in full from
   * sm up.
   */
  readonly compactOnMobile?: boolean;
}) {
  const current = Math.min(
    stages.filter((stage) => stage === "done").length,
    STAGES.length - 1,
  );
  const activeIndex = stages.indexOf("active");
  const headline = STAGES[activeIndex === -1 ? current : activeIndex];
  const doneCount = stages.filter((stage) => stage === "done").length;

  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-4", className)}
      aria-live="polite"
    >
      <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
        <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
        Sahayak
      </p>

      {compactOnMobile ? (
        <div className="mt-2 sm:hidden">
          <p className="text-sm font-medium">{headline}</p>
          <div aria-hidden="true" className="mt-2 flex gap-1">
            {STAGES.map((label, index) => (
              <span
                key={label}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  index < doneCount ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
            Step {Math.min(doneCount + 1, STAGES.length)} of {STAGES.length}
          </p>
        </div>
      ) : null}

      <ol className={cn("mt-3 space-y-2", compactOnMobile && "hidden sm:block sm:space-y-2")}>
        {STAGES.map((label, index) => {
          const stage = stages[index] ?? "pending";

          return (
            <li key={label} className="flex items-center gap-2.5 text-sm">
              <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
                {stage === "done" ? (
                  <Check className="size-4 text-primary" strokeWidth={3} />
                ) : stage === "active" ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Circle className="size-2.5 text-muted-foreground/40" />
                )}
              </span>

              <span
                className={cn(
                  stage === "done" && "text-foreground",
                  stage === "active" && "font-medium text-foreground",
                  stage === "pending" && "text-muted-foreground/70",
                )}
              >
                {label}
              </span>

              <span className="sr-only">
                {stage === "done" ? "complete" : stage === "active" ? "in progress" : "not started"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
