"use client";

import { CircleAlert } from "lucide-react";
import { cn } from "cn";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DESCRIPTION_MAX_LENGTH } from "@/lib/report/schema";

export type IncidentDetailsValues = {
  readonly description: string;
  readonly date: string;
  readonly time: string;
  readonly location: string;
  readonly additionalContext: string;
};

type StepIncidentDetailsProps = {
  readonly values: IncidentDetailsValues;
  readonly onChange: (field: keyof IncidentDetailsValues, value: string) => void;
  readonly errors: Record<string, string>;
};

function FieldError({ id, message }: { readonly id: string; readonly message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-sm font-medium text-destructive"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

/**
 * "Tell us what happened" rather than a government form (Docs/11-UI-UX.md §3).
 *
 * Only the description is required, and the layout says so: it stands alone at
 * full weight, while everything optional is grouped into a single quieter card.
 * The flow never demands information the citizen does not have.
 */
export function StepIncidentDetails({
  values,
  onChange,
  errors,
}: StepIncidentDetailsProps) {
  const used = values.description.length;
  const isNearLimit = used > DESCRIPTION_MAX_LENGTH * 0.9;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Tell us what happened</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use your own words. There is no right format, and you only need to fill
          in what you actually know.
        </p>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="description" className="text-[0.9375rem]">
          What happened?
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
          <span className="sr-only">(required)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={7}
          value={values.description}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Describe the problem in your own words — what you saw, when, and why it matters."
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          aria-invalid={Boolean(errors.description)}
          className="min-h-40"
        />
        <div className="flex items-start justify-between gap-4">
          <p id="description-hint" className="text-xs leading-relaxed text-muted-foreground">
            This stays exactly as you wrote it. It is never rewritten.
          </p>
          <p
            className={cn(
              "shrink-0 text-xs tabular-nums",
              isNearLimit ? "font-medium text-severity-medium" : "text-muted-foreground",
            )}
          >
            {used}/{DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
        <FieldError id="description-error" message={errors.description} />
      </div>

      <Card>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Add context if you have it</h3>
            <p className="text-xs text-muted-foreground">
              All optional. Leave anything blank that you are unsure about.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={values.date}
                onChange={(event) => onChange("date", event.target.value)}
                aria-describedby={errors.date ? "date-error" : undefined}
                aria-invalid={Boolean(errors.date)}
              />
              <FieldError id="date-error" message={errors.date} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={values.time}
                onChange={(event) => onChange("time", event.target.value)}
                aria-describedby={errors.time ? "time-error" : undefined}
                aria-invalid={Boolean(errors.time)}
              />
              <FieldError id="time-error" message={errors.time} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={values.location}
              onChange={(event) => onChange("location", event.target.value)}
              placeholder="For example: near the main bus stop, Tirur"
              aria-describedby={errors.location ? "location-error" : "location-hint"}
              aria-invalid={Boolean(errors.location)}
            />
            <p id="location-hint" className="text-xs leading-relaxed text-muted-foreground">
              An approximate description is fine. Share only what you are
              comfortable sharing.
            </p>
            <FieldError id="location-error" message={errors.location} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalContext">Anything else?</Label>
            <Textarea
              id="additionalContext"
              name="additionalContext"
              rows={3}
              value={values.additionalContext}
              onChange={(event) => onChange("additionalContext", event.target.value)}
              placeholder="Route or vehicle number, how long it has been happening, anyone affected."
              aria-describedby={errors.additionalContext ? "context-error" : undefined}
              aria-invalid={Boolean(errors.additionalContext)}
              className="min-h-24"
            />
            <FieldError id="context-error" message={errors.additionalContext} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
