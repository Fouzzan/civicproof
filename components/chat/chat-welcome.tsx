import { MessageSquareQuote, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The opening state of a conversation.
 *
 * One job: make it obvious the citizen should describe their situation in their
 * own words, not look for a scheme or start a form.
 *
 * The examples span different areas of life on purpose. Sahayak covers six
 * categories, and an opening screen that only showed farming would quietly tell
 * a student or a jobseeker that this product is not for them.
 */
const EXAMPLES = [
  "My daughter is going to college next year and we're struggling with the fees.",
  "I lost my job recently and I'm looking for work.",
  "I'm 68, I live alone, and I don't get a pension.",
  "What's the status of my application?",
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
        What&rsquo;s happening in your life?
      </h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        Tell me in your own words. You don&rsquo;t need to know which service you
        need, or any official terms — I&rsquo;ll work that out and only ask for
        what matters.
      </p>

      <p className="mt-8 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <MessageSquareQuote aria-hidden="true" className="size-3.5" />
        For example
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
        A demonstration. The services are fictional and applications are
        simulated — nothing is sent to a real government department.
      </p>
    </div>
  );
}
