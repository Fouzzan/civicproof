"use client";

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
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

/**
 * "Tell us what happened" rather than a government form (Docs/11-UI-UX.md §3).
 * Only the description is required; everything else is explicitly optional so
 * the flow never demands information the citizen does not have.
 */
export function StepIncidentDetails({
  values,
  onChange,
  errors,
}: StepIncidentDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Tell us what happened</h2>
        <p className="text-sm text-muted-foreground">
          Use your own words. There is no right format, and you only need to fill
          in what you actually know.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          What happened? <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          value={values.description}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Describe the problem in your own words — what you saw, when, and why it matters."
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          aria-invalid={Boolean(errors.description)}
        />
        <div className="flex items-start justify-between gap-3">
          <p id="description-hint" className="text-xs text-muted-foreground">
            This stays exactly as you wrote it. It is never rewritten.
          </p>
          <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {values.description.length}/{DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
        <FieldError id="description-error" message={errors.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date (optional)</Label>
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
          <Label htmlFor="time">Time (optional)</Label>
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
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          name="location"
          value={values.location}
          onChange={(event) => onChange("location", event.target.value)}
          placeholder="For example: near the main bus stop, Tirur"
          aria-describedby={errors.location ? "location-error" : "location-hint"}
          aria-invalid={Boolean(errors.location)}
        />
        <p id="location-hint" className="text-xs text-muted-foreground">
          An approximate description is fine. Share only what you are comfortable
          sharing.
        </p>
        <FieldError id="location-error" message={errors.location} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalContext">Anything else? (optional)</Label>
        <Textarea
          id="additionalContext"
          name="additionalContext"
          rows={3}
          value={values.additionalContext}
          onChange={(event) => onChange("additionalContext", event.target.value)}
          placeholder="Route or vehicle number, how long it has been happening, anyone affected."
          aria-describedby={errors.additionalContext ? "context-error" : undefined}
          aria-invalid={Boolean(errors.additionalContext)}
        />
        <FieldError id="context-error" message={errors.additionalContext} />
      </div>
    </div>
  );
}
