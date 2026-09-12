import { Camera, FileText, ListChecks, Signpost } from "lucide-react";
import { cn } from "cn";

import { Container } from "@/components/layout/container";

/**
 * The four stages of a case, drawn as one connected journey.
 *
 * The connector is the point: these are sequential stages of the same case,
 * not four unrelated features. It runs vertically on a phone and horizontally
 * on a wide screen, and is decorative in both — the numbers and headings carry
 * the order on their own.
 */
const STAGES = [
  {
    key: "report",
    icon: FileText,
    title: "Report",
    body: "Describe what happened in your own words. It is never rewritten.",
  },
  {
    key: "verify",
    icon: Camera,
    title: "Verify",
    body: "Attach a photo. It stays private and travels with the case.",
  },
  {
    key: "act",
    icon: Signpost,
    title: "Act",
    body: "See a suggested severity and which kind of authority usually handles it.",
  },
  {
    key: "track",
    icon: ListChecks,
    title: "Track",
    body: "Keep a reference and follow a timeline of what has actually happened.",
  },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="border-b border-border">
      <Container>
        <div className="py-16 sm:py-20">
          <h2
            id="how-it-works"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            How a case moves
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            One report, four stages, and nothing hidden between them.
          </p>

          <ol className="mt-12 grid gap-7 lg:grid-cols-4 lg:gap-8">
            {STAGES.map((stage, index) => {
              const isLast = index === STAGES.length - 1;

              return (
                <li key={stage.key} className="relative flex gap-4 lg:block">
                  {!isLast ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute top-12 -bottom-7 left-[1.375rem] w-px bg-border lg:hidden"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute top-[1.375rem] -right-8 left-14 hidden h-px bg-border lg:block"
                      />
                    </>
                  ) : null}

                  <span
                    className={cn(
                      "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl",
                      "bg-card text-primary shadow-sm ring-1 ring-border",
                    )}
                  >
                    <stage.icon aria-hidden="true" className="size-5" />
                  </span>

                  <div className="min-w-0 lg:mt-5">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{stage.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {stage.body}
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
