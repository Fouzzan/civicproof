import Link from "next/link";
import { ArrowDown, FilePlus2, FlaskConical } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ServiceConstellation } from "@/components/marketing/service-constellation";
import { SituationInput } from "@/components/marketing/situation-input";
import { Button } from "@/components/ui/button";

/**
 * The first screen.
 *
 * One focal point: the open question. Everything else — the headline, the
 * journey diagram, the secondary link — exists to explain why answering it is
 * worth a citizen's time.
 *
 * The headline names the actual problem. People do not fail to get support
 * because the support is missing; they fail because the language around it is
 * impenetrable.
 */
export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div
        aria-hidden="true"
        className="bg-civic-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-severity-medium/30 bg-severity-medium/10 px-3 py-1 text-xs font-semibold text-severity-medium">
              <FlaskConical aria-hidden="true" className="size-3.5" />
              Demonstration build
            </span>

            <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Government support,
              <br className="hidden sm:block" /> without the government language.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Tell Sahayak what&rsquo;s happening in your life. It finds relevant
              services, explains what you may qualify for, helps prepare the next
              step, and keeps your journey organised.
            </p>

            <div className="mt-8 max-w-2xl">
              <SituationInput />
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href="/cases">
                  <FilePlus2 aria-hidden="true" />
                  Submit a Complaint
                </Link>
              </Button>

              <Button asChild variant="ghost" size="lg" className="sm:-ml-2">
                <Link href="#categories">
                  <ArrowDown aria-hidden="true" />
                  Explore services
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:pl-2">
            <ServiceConstellation />
          </div>
        </div>
      </Container>
    </section>
  );
}
