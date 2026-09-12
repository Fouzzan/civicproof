import { ClipboardCheck, FileText, ListChecks, MessageSquareQuote, Search } from "lucide-react";
import { cn } from "cn";

import { Container } from "@/components/layout/container";

/**
 * The five steps, as a connected journey.
 *
 * This is the section that separates Sahayak from a scheme finder, so the
 * connector is doing real work: these are stages of one case, not five
 * features. A discovery tool would stop after step 02.
 *
 * Vertical on a phone, horizontal from lg. The connector is decorative in both
 * — the numbers and headings carry the order on their own.
 */
const STEPS = [
  {
    icon: MessageSquareQuote,
    title: "Tell us what's happening",
    body: "Describe your situation in your own words. No form, no scheme name.",
  },
  {
    icon: Search,
    title: "Sahayak finds relevant support",
    body: "It searches the supported services and explains what may apply to you.",
  },
  {
    icon: ListChecks,
    title: "Check what you qualify for",
    body: "Only the questions that matter, then a decision from the service's own rules.",
  },
  {
    icon: FileText,
    title: "Prepare and review",
    body: "Your application is filled in from what you already said. You check it and correct anything.",
  },
  {
    icon: ClipboardCheck,
    title: "Track what happens next",
    body: "Confirm, and you get a reference you can come back to at any time.",
  },
] as const;

export function HowSahayakWorks() {
  return (
    <section aria-labelledby="how-it-works" className="border-t border-border">
      <Container>
        <div className="py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2
              id="how-it-works"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              How Sahayak works
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Most tools stop once they have shown you a scheme. Sahayak carries
              on from there.
            </p>
          </div>

          <ol className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((step, index) => {
              const isLast = index === STEPS.length - 1;

              return (
                <li key={step.title} className="relative flex gap-4 lg:block">
                  {!isLast ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute top-12 -bottom-8 left-[1.375rem] w-px bg-border lg:hidden"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute top-[1.375rem] -right-6 left-14 hidden h-px bg-border lg:block"
                      />
                    </>
                  ) : null}

                  <span
                    className={cn(
                      "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl",
                      "bg-card text-primary shadow-sm ring-1 ring-border",
                    )}
                  >
                    <step.icon aria-hidden="true" className="size-5" />
                  </span>

                  <div className="min-w-0 lg:mt-5">
                    <p className="font-mono text-xs font-semibold text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-[0.9375rem] font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
