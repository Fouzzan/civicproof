import { MessageSquareQuote, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The opening state.
 *
 * It has one job: make it obvious that the citizen should describe their
 * situation in their own words, not look for a scheme or start a form. The
 * examples are phrased the way someone actually speaks, because the whole
 * premise is that they should not need the official vocabulary.
 */
const EXAMPLES = [
  "I am a farmer and my income is low. Is there any support I can get?",
  "I am 62, I farm a small plot, and money is tight this year.",
  "What is the status of my application?",
] as const;

export function ChatWelcome({
  onPick,
  disabled,
}: {
  readonly onPick: (text: string) => void;
  readonly disabled: boolean;
}) {
  return (
    <div className="py-8 sm:py-12">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles aria-hidden="true" className="size-6" />
      </span>

      <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
        Tell me what you need help with.
      </h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        You do not need to know the scheme name or fill in a form first. Describe
        your situation in your own words and I will work out what applies.
      </p>

      <p className="mt-8 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <MessageSquareQuote aria-hidden="true" className="size-3.5" />
        Try saying
      </p>

      <ul className="mt-3 space-y-2">
        {EXAMPLES.map((example) => (
          <li key={example}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onPick(example)}
              disabled={disabled}
              className="h-auto w-full justify-start px-4 py-3 text-left text-sm leading-relaxed whitespace-normal"
            >
              {example}
            </Button>
          </li>
        ))}
      </ul>

      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        This is a demonstration. The scheme is fictional, and submitting an
        application here does not send anything to a real government department.
      </p>
    </div>
  );
}
