"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";

const EXAMPLES = [
  "I'm looking for work and training.",
  "My daughter needs help with college fees.",
  "I'm a senior citizen and need support.",
  "I need help with housing.",
] as const;

/**
 * The product's front door.
 *
 * A citizen starts from their situation, not from a scheme name or a form, so
 * this is a single open question rather than a search box or a category picker.
 * Whatever they type is carried to the conversation as their opening message —
 * nobody should have to say the same thing twice.
 *
 * The microphone is a RESERVED AFFORDANCE, not a working control. Voice has its
 * own phase; showing a mic that silently does nothing would be worse than
 * showing none, so it is genuinely disabled and says so. The layout is sized
 * for it now so adding it later is a swap, not a redesign.
 */
export function SituationInput({ autoFocus = false }: { readonly autoFocus?: boolean }) {
  const [situation, setSituation] = useState("");
  const router = useRouter();

  function start(text: string) {
    const trimmed = text.trim();
    const target =
      trimmed.length > 0
        ? `/chat?situation=${encodeURIComponent(trimmed.slice(0, 2000))}`
        : "/chat";

    router.push(target);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    start(situation);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit}>
        <label htmlFor="situation" className="sr-only">
          Tell Sahayak what is happening in your life
        </label>

        <div className="flex items-center gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 sm:gap-3 sm:p-2.5">
          <span
            aria-hidden="true"
            className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:flex"
            title="Voice input is not available yet"
          >
            <Mic className="size-5" />
          </span>

          <input
            id="situation"
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            autoFocus={autoFocus}
            maxLength={2000}
            placeholder="Tell Sahayak what's happening in your life…"
            className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground sm:text-[1.0625rem]"
          />

          <Button
            type="submit"
            size="icon-lg"
            aria-label="Start with Sahayak"
            className="shrink-0 rounded-xl"
          >
            <ArrowRight className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => start(example)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors outline-none hover:border-input hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
