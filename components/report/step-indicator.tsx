import { Check } from "lucide-react";
import { cn } from "cn";

type StepIndicatorProps = {
  readonly steps: readonly string[];
  readonly currentStep: number;
};

/**
 * Progress through the reporting flow.
 *
 * Two presentations of the same state: a compact bar on a phone, where five
 * labels will not fit legibly, and a full stepper from md up. Both are marked
 * decorative — the live region below them is what a screen reader announces,
 * so progress is never conveyed by colour or position alone
 * (Docs/03-REQUIREMENTS.md NFR-008).
 */
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const total = steps.length;

  return (
    <div>
      <div className="space-y-2.5 md:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">{steps[currentStep]}</p>
          <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
            Step {currentStep + 1} of {total}
          </p>
        </div>
        <div aria-hidden="true" className="flex gap-1.5">
          {steps.map((step, index) => (
            <span
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                index <= currentStep ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <ol aria-hidden="true" className="hidden items-center md:flex">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === total - 1;

          return (
            <li
              key={step}
              className={cn("flex items-center", isLast ? "shrink-0" : "flex-1")}
            >
              <div className="flex shrink-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    isDone && "bg-primary text-primary-foreground",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/15",
                    !isDone && !isCurrent && "bg-card text-muted-foreground ring-1 ring-border",
                  )}
                >
                  {isDone ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-sm whitespace-nowrap transition-colors",
                    isCurrent
                      ? "font-semibold text-foreground"
                      : isDone
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {step}
                </span>
              </div>

              {!isLast ? (
                <span
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors duration-300",
                    isDone ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <p aria-live="polite" className="sr-only">
        Step {currentStep + 1} of {total}: {steps[currentStep]}
      </p>
    </div>
  );
}
