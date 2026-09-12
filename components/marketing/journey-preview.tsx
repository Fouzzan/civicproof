import { GraduationCap } from "lucide-react";

import { AgentActivity } from "@/components/chat/agent-activity";
import { DemoBadge } from "@/components/cards/demo-label";
import { Container } from "@/components/layout/container";

/**
 * Sahayak working, shown rather than described.
 *
 * The activity panel is the real component the chat uses, and the service named
 * is a real entry in the demonstration catalogue — so this is a still frame of
 * the product, not an illustration of one. The stages are frozen mid-journey on
 * purpose: it is the middle of the process that makes the point, because that
 * is where a scheme finder would already have stopped.
 */
export function JourneyPreview() {
  return (
    <section aria-labelledby="preview" className="border-t border-border bg-card">
      <Container>
        <div className="py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 id="preview" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What it looks like
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              A parent describes a problem. Sahayak does the rest of the work.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
            <div className="space-y-5">
              <div className="flex justify-end">
                <p className="max-w-md rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-[0.9375rem] leading-relaxed text-primary-foreground">
                  My daughter is going to college next year and we&rsquo;re
                  struggling with the fees.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap aria-hidden="true" className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Education
                      </p>
                      <DemoBadge />
                    </div>

                    <h3 className="mt-1.5 text-base font-semibold">
                      Student Education Assistance
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Support with course and living costs for students from
                      lower-income households.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Sahayak then asks only the questions this service needs, checks
                the answer against its rules, and prepares the application for
                review.
              </p>
            </div>

            <AgentActivity
              stages={["done", "done", "active", "pending", "pending"]}
              className="bg-background lg:sticky lg:top-24"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
