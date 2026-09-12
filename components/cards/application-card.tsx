"use client";

import { useState } from "react";
import { CircleCheck, Loader2, Pencil, Send, ShieldCheck } from "lucide-react";

import { DemoBadge } from "@/components/cards/demo-label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ApplicationFieldView, ApplicationView } from "@/lib/agent/cards";

type ApplicationCardProps = {
  readonly application: ApplicationView;
  /** Called after confirmation is recorded, so the chat can ask for submission. */
  readonly onConfirmed: () => void;
  readonly disabled: boolean;
};

function formatValue(field: ApplicationFieldView): string {
  if (field.value === null) {
    return "Not provided";
  }

  if (typeof field.value === "boolean") {
    return field.value ? "Yes" : "No";
  }

  if (typeof field.value === "number") {
    const formatted = new Intl.NumberFormat("en-IN").format(field.value);

    return field.unit ? `${formatted} ${field.unit}` : formatted;
  }

  return field.value;
}

/**
 * The application preview, and the confirmation boundary.
 *
 * Two things here are load-bearing. The banner says the application has not
 * been submitted, so a citizen reading quickly cannot mistake a preview for a
 * receipt. And the confirm button is the ONLY path to a valid `confirmedAt` —
 * it posts to a route the agent cannot reach, which is what stops an
 * application being filed on someone's behalf.
 *
 * Editing is conversational: the citizen types the correction and the agent
 * re-runs the tools. That keeps one source of truth for the facts instead of a
 * form that could drift away from what the checker actually evaluated.
 */
export function ApplicationCard({
  application,
  onConfirmed,
  disabled,
}: ApplicationCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isConfirmed, setIsConfirmed] = useState(false);

  async function confirm() {
    if (isConfirming || isConfirmed) {
      return;
    }

    setIsConfirming(true);
    setError(undefined);

    try {
      const response = await fetch("/api/application/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.applicationId }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);

        setError(
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error: unknown }).error)
            : "Your confirmation could not be recorded. Nothing was submitted.",
        );
        return;
      }

      setIsConfirmed(true);
      onConfirmed();
    } catch {
      setError("We could not reach Sahayak. Nothing was submitted — please try again.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold tracking-wide uppercase">
            Your application
          </h3>
          {application.isDemo ? <DemoBadge /> : null}
        </div>

        <p className="rounded-lg border border-severity-medium/30 bg-severity-medium/10 px-3 py-2 text-xs font-semibold text-severity-medium">
          Not submitted yet — please check everything below.
        </p>

        <p className="text-sm text-muted-foreground">{application.schemeName}</p>

        <Separator />

        <dl className="divide-y divide-border">
          {application.fields.map((field) => (
            <div key={field.id} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-sm text-muted-foreground">{field.label}</dt>
              <dd
                className={
                  field.value === null
                    ? "text-sm text-muted-foreground italic"
                    : "text-sm font-medium break-words"
                }
              >
                {formatValue(field)}
              </dd>
            </div>
          ))}
        </dl>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Pencil aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Something wrong? Just tell me in the box below — for example &ldquo;my income
          is actually 80,000&rdquo; — and I will update it.
        </p>

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        {application.readyToConfirm ? (
          /*
           * The confirmation gate, given its own panel on purpose.
           *
           * This is the one irreversible action in the whole journey, and the
           * single point where a person — not the agent — decides. It should
           * not read as one more button in a list of card content.
           */
          <div className="space-y-3 rounded-xl border-2 border-primary/30 bg-primary/[0.04] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
              Ready to submit?
            </p>

            <p className="text-xs leading-relaxed text-muted-foreground">
              This records your application in the Sahayak{" "}
              <strong className="text-foreground">demonstration system only</strong>. It
              will <strong className="text-foreground">not</strong> be sent to a real
              government department.
            </p>

            <Button
              type="button"
              size="lg"
              onClick={confirm}
              disabled={disabled || isConfirming || isConfirmed}
              className="w-full"
            >
              {isConfirming ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Recording your demo application…
                </>
              ) : isConfirmed ? (
                <>
                  <CircleCheck aria-hidden="true" />
                  Confirmed
                </>
              ) : (
                <>
                  <Send aria-hidden="true" />
                  Confirm &amp; submit demo application
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Nothing is filed until you press this.
            </p>
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
            I still need a little more before you can submit this.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
