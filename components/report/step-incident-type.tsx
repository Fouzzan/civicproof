"use client";

import { Lock } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import {
  INCIDENT_TYPES,
  type IncidentTypeValue,
} from "@/lib/report/incident-types";

type StepIncidentTypeProps = {
  readonly value: IncidentTypeValue | null;
  readonly onChange: (value: IncidentTypeValue) => void;
  readonly error?: string;
};

/**
 * Category selection as cards rather than a dropdown (Docs/11-UI-UX.md §3).
 * Implemented as a radiogroup so keyboard and screen-reader users get real
 * radio semantics.
 */
export function StepIncidentType({ value, onChange, error }: StepIncidentTypeProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="space-y-1">
        <span className="block text-lg font-semibold">What kind of problem is it?</span>
        <span className="block text-sm text-muted-foreground">
          Pick the closest match. You can describe the specifics next.
        </span>
      </legend>

      <div role="radiogroup" aria-label="Incident type" className="grid gap-3">
        {INCIDENT_TYPES.map((type) => {
          const isSelected = value === type.value;

          return (
            <button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(type.value)}
              className={cn(
                "rounded-lg border p-4 text-left outline-none transition-colors",
                "focus-visible:ring-3 focus-visible:ring-ring/50",
                isSelected
                  ? "border-primary bg-muted"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{type.label}</span>
                {type.sensitive ? (
                  <Badge variant="secondary">
                    <Lock aria-hidden="true" />
                    Private
                  </Badge>
                ) : null}
                {isSelected ? (
                  <span className="text-xs text-muted-foreground">Selected</span>
                ) : null}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {type.description}
              </span>
              <span className="mt-2 block text-xs text-muted-foreground">
                For example: {type.examples}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
