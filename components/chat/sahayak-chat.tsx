"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { cn } from "cn";

import { AgentActivity, deriveStages } from "@/components/chat/agent-activity";
import { ApplicationCard } from "@/components/cards/application-card";
import { EligibilityCard } from "@/components/cards/eligibility-card";
import { ErrorCard } from "@/components/cards/error-card";
import { SchemeCard } from "@/components/cards/scheme-card";
import { StatusCard } from "@/components/cards/status-card";
import { SubmissionCard } from "@/components/cards/submission-card";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { Button } from "@/components/ui/button";
import type { AgentCard, ChatTurnResponse } from "@/lib/agent/cards";

/**
 * The Sahayak conversation.
 *
 * All state for the journey lives on the server: this component sends a
 * message and renders what comes back. It deliberately holds no copy of the
 * citizen's facts, eligibility or draft, so there is no second version of the
 * truth that could drift from what the tools actually computed.
 *
 * The message the citizen sees is the model's prose; the cards beneath it come
 * from real tool results. When those disagree, the cards are what is true.
 */

type Entry =
  | { readonly kind: "user"; readonly id: string; readonly text: string }
  | {
      readonly kind: "agent";
      readonly id: string;
      readonly text: string;
      readonly cards: readonly AgentCard[];
    };

/** Honest about what is happening, without naming tools or the model. */
const THINKING_DEFAULT = "Sahayak is thinking…";
const THINKING_SUBMIT = "Recording your application in the demo system…";

const CONFIRM_MESSAGE = "I confirm. Please submit my application.";

function newId(): string {
  return crypto.randomUUID();
}

function UserBubble({ text }: { readonly text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-primary-foreground sm:max-w-[75%]">
        {text}
      </p>
    </div>
  );
}

function AgentBubble({ text }: { readonly text: string }) {
  if (text.trim().length === 0) {
    return null;
  }

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles aria-hidden="true" className="size-3.5" />
      </span>
      <p className="max-w-[85%] text-[0.9375rem] leading-relaxed whitespace-pre-wrap sm:max-w-[75%]">
        {text}
      </p>
    </div>
  );
}

function Thinking({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles aria-hidden="true" className="size-3.5 animate-pulse" />
      </span>
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {label}
        <span className="flex gap-1" aria-hidden="true">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </span>
    </div>
  );
}

export function SahayakChat({
  initialMessage,
}: {
  /** A situation typed on the landing page, sent once on arrival. */
  readonly initialMessage?: string;
}) {
  const [entries, setEntries] = useState<readonly Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState(THINKING_DEFAULT);

  const endRef = useRef<HTMLDivElement>(null);
  const openingSent = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries, isBusy]);

  // Wake the database while the citizen reads the welcome screen. Neon suspends
  // its compute when idle and the first connection afterwards fails outright,
  // which would otherwise surface as an error on their opening message.
  // Fire-and-forget: a failure here changes nothing on screen.
  useEffect(() => {
    void fetch("/api/health").catch(() => undefined);
  }, []);

  const send = useCallback(
    async (text: string, label: string = THINKING_DEFAULT) => {
      const trimmed = text.trim();

      if (trimmed.length === 0 || isBusy) {
        return;
      }

      setIsBusy(true);
      setThinkingLabel(label);
      setDraft("");
      setEntries((current) => [...current, { kind: "user", id: newId(), text: trimmed }]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            payload && typeof payload === "object" && "error" in payload
              ? String((payload as { error: unknown }).error)
              : "Sahayak is unavailable right now. Please try again.";

          setEntries((current) => [
            ...current,
            { kind: "agent", id: newId(), text: "", cards: [{ kind: "error", message }] },
          ]);
          return;
        }

        const turn = payload as ChatTurnResponse;

        setEntries((current) => [
          ...current,
          {
            kind: "agent",
            id: newId(),
            text: turn.message ?? "",
            cards: turn.cards ?? [],
          },
        ]);
      } catch {
        setEntries((current) => [
          ...current,
          {
            kind: "agent",
            id: newId(),
            text: "",
            cards: [
              {
                kind: "error",
                message:
                  "I could not reach Sahayak. Check your connection — nothing you told me has been lost.",
              },
            ],
          },
        ]);
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy],
  );

  // Send the situation carried over from the landing page, exactly once. The
  // ref guard matters: React runs effects twice in development, and a second
  // send would post the citizen's opening line twice.
  useEffect(() => {
    if (!initialMessage || openingSent.current) {
      return;
    }

    openingSent.current = true;
    void send(initialMessage);
  }, [initialMessage, send]);

  /**
   * Confirmation has already been recorded by the card before this runs, so
   * this turn only asks the agent to act on it. The agent still cannot submit
   * without the stored timestamp.
   */
  const handleConfirmed = useCallback(() => {
    void send(CONFIRM_MESSAGE, THINKING_SUBMIT);
  }, [send]);

  async function startOver() {
    if (isBusy) {
      return;
    }

    setIsBusy(true);

    try {
      await fetch("/api/chat", { method: "DELETE" });
      setEntries([]);
      setDraft("");
    } catch {
      // A failed reset leaves the conversation exactly as it was, which is safe.
    } finally {
      setIsBusy(false);
    }
  }

  // Only the newest application card stays interactive: confirming an earlier,
  // superseded draft would submit something the citizen has since corrected.
  const liveApplicationId = [...entries]
    .reverse()
    .flatMap((entry) => (entry.kind === "agent" ? entry.cards : []))
    .find((card) => card.kind === "application" || card.kind === "submission");

  const activeApplicationId =
    liveApplicationId?.kind === "application"
      ? liveApplicationId.application.applicationId
      : null;

  // Every card the conversation has produced, so the activity panel reflects
  // the whole journey rather than only the most recent turn.
  const allCards = entries.flatMap((entry) => (entry.kind === "agent" ? entry.cards : []));
  const stages = deriveStages(allCards, entries.length > 0, isBusy);

  /**
   * The newest card of each kind, by position in the transcript.
   *
   * A correction produces a fresh eligibility or application card further down,
   * and the earlier one is then wrong. Scrolling back to a stale "you are
   * eligible" is exactly the confusion this prevents — older cards stay visible
   * for context but are dimmed and labelled, so only one version reads as
   * current. Errors are excluded: each is its own event, not a revision.
   */
  const newestOfKind = new Map<string, string>();
  for (const entry of entries) {
    if (entry.kind !== "agent") continue;
    entry.cards.forEach((card, index) => {
      if (card.kind !== "error") newestOfKind.set(card.kind, `${entry.id}:${index}`);
    });
  }

  function renderCard(card: AgentCard, index: number, entryId: string) {
    const isStale =
      card.kind !== "error" && newestOfKind.get(card.kind) !== `${entryId}:${index}`;

    const body = (() => {
      switch (card.kind) {
        case "scheme":
          return <SchemeCard schemes={card.schemes} />;

        case "eligibility":
          return <EligibilityCard eligibility={card.eligibility} />;

        case "application":
          return (
            <ApplicationCard
              application={card.application}
              onConfirmed={handleConfirmed}
              disabled={
                isBusy || isStale || card.application.applicationId !== activeApplicationId
              }
            />
          );

        case "submission":
          return <SubmissionCard submission={card.submission} />;

        case "status":
          return <StatusCard status={card.status} />;

        case "error":
          return <ErrorCard message={card.message} />;
      }
    })();

    if (!isStale) {
      return <div key={index}>{body}</div>;
    }

    return (
      <div key={index} className="relative">
        <div className="pointer-events-none opacity-45 grayscale">{body}</div>
        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          Updated further down after your change.
        </p>
      </div>
    );
  }

  return (
    // Fixed to the viewport below the 4rem header, with the transcript
    // scrolling inside it. The composer then sits outside the scroll area and
    // is always reachable — a `sticky` composer with page content beneath it
    // stops being pinned once you scroll past, which on a long conversation
    // means hunting for the input.
    // 100dvh rather than 100vh so mobile browser chrome does not crop it.
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {entries.length > 0 ? (
        <div className="shrink-0 pt-4">
          <AgentActivity stages={stages} compactOnMobile />
        </div>
      ) : null}

      <div className="flex-1 space-y-6 overflow-y-auto py-6">
        {entries.length === 0 && !isBusy ? (
          <ChatWelcome onPick={(text) => void send(text)} disabled={isBusy} />
        ) : null}

        {entries.map((entry) => (
          <div key={entry.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {entry.kind === "user" ? (
              <UserBubble text={entry.text} />
            ) : (
              <div className="space-y-4">
                <AgentBubble text={entry.text} />
                {entry.cards.length > 0 ? (
                  <div className={cn("space-y-3", entry.text.trim().length > 0 && "sm:pl-10")}>
                    {entry.cards.map((card, index) => renderCard(card, index, entry.id))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}

        {isBusy ? <Thinking label={thinkingLabel} /> : null}

        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-background pt-4 pb-4">
        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSend={() => void send(draft)}
          isBusy={isBusy}
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Demonstration only — nothing is sent to a real government department.
          </p>
          {entries.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void startOver()}
              disabled={isBusy}
              className="shrink-0"
            >
              <RotateCcw aria-hidden="true" />
              Start over
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
