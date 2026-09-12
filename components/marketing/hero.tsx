import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import { Container } from "@/components/layout/container";
import { CasePreview } from "@/components/marketing/case-preview";
import { Button } from "@/components/ui/button";

/**
 * The hero states the product's promise and then shows it: the claim on the
 * left, an actual CivicProof case on the right.
 *
 * The privacy line sits with the call to action rather than further down the
 * page, because it is the thing a person weighing whether to report a
 * harassment incident needs before they click, not after.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div
        aria-hidden="true"
        className="bg-civic-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black,transparent)]"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
              Evidence-backed civic reporting
            </span>

            <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Turn a problem into a case that can be acted on.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              CivicProof helps you document an incident, understand what to do
              next, and follow the case from report to resolution.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/report">
                  Report an Issue
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/cases">Track a Case</Link>
              </Button>
            </div>

            <p className="mt-7 flex items-start gap-2.5 text-sm text-muted-foreground">
              <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                Harassment and safety reports are private by default, and your
                photos are never published.
              </span>
            </p>
          </div>

          <div className="lg:pl-4">
            <CasePreview />
          </div>
        </div>
      </Container>
    </section>
  );
}
