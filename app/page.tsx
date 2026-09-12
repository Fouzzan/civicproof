import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Placeholder home page for the application shell.
 *
 * The full landing experience is specified in Docs/11-UI-UX.md and is built in a
 * later implementation task. This page exists to confirm the shell renders:
 * branding, layout, Tailwind styling and a shadcn/ui component.
 */
const WORKFLOW_STEPS = [
  "Incident",
  "Evidence",
  "AI assistance",
  "Case",
  "Resolution",
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Turn a real-world problem into an actionable, trackable case.
        </h1>
        <p className="mt-4 text-base text-muted-foreground text-pretty">
          Report what happened. Add evidence. Get AI-assisted guidance. Track the
          case through to resolution.
        </p>

        <div className="mt-8">
          <Button size="lg" disabled>
            Report an Incident
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            The reporting workflow is not built yet — this is the project shell.
          </p>
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="mt-12">
        <h2 id="workflow-heading" className="sr-only">
          How CivicProof works
        </h2>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-border px-2.5 py-1">
                {step}
              </span>
              {index < WORKFLOW_STEPS.length - 1 ? (
                <span aria-hidden="true">&rarr;</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 flex max-w-2xl items-start gap-3 rounded-lg border border-border p-4">
        <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Sensitive reports, such as harassment or safety incidents, are private
          by default. CivicProof never publishes a report or identifies anyone
          publicly.
        </p>
      </section>
    </div>
  );
}
