"use client";

import { CircleCheck, Construction, Landmark, Lock, ShieldAlert } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { INCIDENT_TYPES, type IncidentTypeValue } from "@/lib/report/incident-types";

type StepIncidentTypeProps = {
  readonly value: IncidentTypeValue | null;
  readonly onChange: (value: IncidentTypeValue) => void;
  readonly error?: string;
};

/**
 * Icons live here rather than on the incident-type definitions: the categories
 * are domain data read on the server too, and they should not carry a
 * dependency on an icon library.
 */
const TYPE_ICON: Record<IncidentTypeValue, typeof Landmark> = {
  CIVIC_PROBLEM: Construction,
  PUBLIC_SERVICE_PROBLEM: Landmark,
  SAFETY_HARASSMENT: ShieldAlert,
};

/**
 * Category selection as cards rather than a dropdown (Docs/11-UI-UX.md §3).
 * Implemented as a radiogroup so keyboard and screen-reader users get real
 * radio semantics, with the whole card as the target.
 */
export function StepIncidentType({ value, onChange, error }: StepIncidentTypeProps) {
  return (
    <fieldset className="space-y-6">
      <legend className="space-y-1.5">
        <span className="block text-xl font-semibold tracking-tight">
          What kind of problem is it?
        </span>
        <span className="block text-sm leading-relaxed text-muted-foreground">
          Pick the closest match. You can describe the specifics next.
        </span>
      </legend>

      <div role="radiogroup" aria-label="Incident type" className="grid gap-3">
        {INCIDENT_TYPES.map((type) => {
          const isSelected = value === type.value;
          const Icon = TYPE_ICON[type.value];

          return (
            <button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(type.value)}
              className={cn(
                "group relative flex gap-4 rounded-xl border p-4 text-left transition-all duration-200 outline-none sm:p-5",
                "focus-visible:ring-3 focus-visible:ring-ring/50",
                isSelected
                  ? "border-primary bg-primary/[0.04] shadow-sm ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-input hover:bg-muted/50 hover:shadow-sm",
              )}
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.9375rem] font-semibold">{type.label}</span>
                  {type.sensitive ? (
                    <Badge variant="secondary">
                      <Lock aria-hidden="true" />
                      Private
                    </Badge>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {type.description}
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                  For example: {type.examples}
                </span>
              </span>

              <CircleCheck
                aria-hidden="true"
                className={cn(
                  "size-5 shrink-0 transition-opacity",
                  isSelected ? "text-primary opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
