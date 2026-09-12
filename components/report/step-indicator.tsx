import { cn } from "cn";

type StepIndicatorProps = {
  readonly steps: readonly string[];
  readonly currentStep: number;
};

/**
 * Progress across the guided reporting flow. The numeric label carries the
 * meaning; colour is never the only signal (Docs/03-REQUIREMENTS.md NFR-008).
 */
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Step {currentStep + 1} of {steps.length}
        <span className="text-foreground"> &middot; {steps[currentStep]}</span>
      </p>
      <ol className="flex gap-1.5" aria-label="Progress">
        {steps.map((step, index) => (
          <li key={step} className="flex-1">
            <span className="sr-only">
              {step}
              {index < currentStep
                ? " (completed)"
                : index === currentStep
                  ? " (current)"
                  : " (not started)"}
            </span>
            <div
              aria-hidden="true"
              className={cn(
                "h-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-border",
              )}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
