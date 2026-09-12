"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import {
  ImmediateSafetyGuidance,
  PrivateReportNotice,
} from "@/components/report/safety-notice";
import { StepEvidence } from "@/components/report/step-evidence";
import { StepIncidentDetails, type IncidentDetailsValues } from "@/components/report/step-incident-details";
import { StepIncidentType } from "@/components/report/step-incident-type";
import { StepIndicator } from "@/components/report/step-indicator";
import { StepReview } from "@/components/report/step-review";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  MAX_FILE_COUNT,
  validateEvidenceFile,
  type SelectedEvidence,
} from "@/lib/report/evidence";
import {
  isSensitiveIncidentType,
  type IncidentTypeValue,
} from "@/lib/report/incident-types";
import {
  fieldErrorsFrom,
  incidentDetailsStepSchema,
  incidentTypeStepSchema,
} from "@/lib/report/schema";

const STEPS = ["Type", "Details", "Evidence", "Review"] as const;

const EMPTY_DETAILS: IncidentDetailsValues = {
  description: "",
  date: "",
  time: "",
  location: "",
  additionalContext: "",
};

/**
 * The guided reporting flow.
 *
 * All state lives here, in the browser, for the duration of the flow. Nothing is
 * persisted: case creation, evidence upload and AI analysis are later tasks, so
 * this component deliberately calls no API.
 */
export function ReportWizard() {
  const [step, setStep] = useState(0);
  const [incidentType, setIncidentType] = useState<IncidentTypeValue | null>(null);
  const [details, setDetails] = useState<IncidentDetailsValues>(EMPTY_DETAILS);
  const [evidence, setEvidence] = useState<readonly SelectedEvidence[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evidenceError, setEvidenceError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const router = useRouter();

  const isSensitive = isSensitiveIncidentType(incidentType);

  // Object URLs are created per selected file and must be released so the
  // browser does not hold the image data for the life of the page.
  useEffect(() => {
    return () => {
      evidence.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // Intentionally on unmount only; individual removals revoke their own URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDetail = useCallback(
    (field: keyof IncidentDetailsValues, value: string) => {
      setDetails((current) => ({ ...current, [field]: value }));
      setErrors((current) => {
        if (!current[field]) {
          return current;
        }

        return Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== field),
        );
      });
    },
    [],
  );

  const addEvidence = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setEvidenceError(undefined);

    setEvidence((current) => {
      const accepted: SelectedEvidence[] = [];
      let rejection: string | undefined;

      for (const file of Array.from(files)) {
        if (current.length + accepted.length >= MAX_FILE_COUNT) {
          rejection = `You can attach up to ${MAX_FILE_COUNT} photos.`;
          break;
        }

        const problem = validateEvidenceFile(file);

        if (problem) {
          rejection = problem;
          continue;
        }

        accepted.push({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }

      if (rejection) {
        setEvidenceError(rejection);
      }

      return accepted.length > 0 ? [...current, ...accepted] : current;
    });
  }, []);

  const removeEvidence = useCallback((id: string) => {
    setEvidence((current) => {
      const target = current.find((item) => item.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
    setEvidenceError(undefined);
  }, []);

  async function submitReport() {
    // Guard against a double-click landing two cases in the database. The
    // server also rate-limits, but the first line of defence is not sending the
    // second request at all.
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the reporter's own answers are sent. Sensitivity, status,
        // reporter and timeline actor are all derived on the server.
        body: JSON.stringify({
          incidentType,
          description: details.description,
          date: details.date,
          time: details.time,
          location: details.location,
          additionalContext: details.additionalContext,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error: unknown }).error)
            : "We couldn't create your report. Please try again.";

        setSubmitError(message);
        setIsSubmitting(false);
        return;
      }

      const caseId =
        payload && typeof payload === "object" && "case" in payload
          ? (payload as { case: { caseId?: string } }).case?.caseId
          : undefined;

      if (!caseId) {
        setSubmitError("The report was created but no reference came back. Please check your cases.");
        setIsSubmitting(false);
        return;
      }

      // Stay disabled through navigation so the button cannot fire twice.
      router.push(`/report/created/${caseId}`);
    } catch {
      setSubmitError(
        "We couldn't reach CivicProof. Check your connection and try again — your answers are still here.",
      );
      setIsSubmitting(false);
    }
  }

  function goNext() {
    if (step === 0) {
      const result = incidentTypeStepSchema.safeParse({ incidentType });

      if (!result.success) {
        setErrors({ incidentType: "Choose the kind of problem you are reporting." });
        return;
      }
    }

    if (step === 1) {
      const result = incidentDetailsStepSchema.safeParse(details);

      if (!result.success) {
        setErrors(fieldErrorsFrom(result.error));
        return;
      }
    }

    setErrors({});
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} />

      {/*
        Safety guidance appears the moment a sensitive category is chosen and
        stays visible for the rest of the flow — never gated behind later steps.
      */}
      {isSensitive ? (
        <div className="space-y-3">
          <ImmediateSafetyGuidance />
          <PrivateReportNotice />
        </div>
      ) : null}

      {step === 0 ? (
        <StepIncidentType
          value={incidentType}
          onChange={(value) => {
            setIncidentType(value);
            setErrors({});
          }}
          error={errors.incidentType}
        />
      ) : null}

      {step === 1 ? (
        <StepIncidentDetails values={details} onChange={updateDetail} errors={errors} />
      ) : null}

      {step === 2 ? (
        <StepEvidence
          evidence={evidence}
          onAdd={addEvidence}
          onRemove={removeEvidence}
          error={evidenceError}
        />
      ) : null}

      {step === 3 ? (
        <StepReview incidentType={incidentType} details={details} evidence={evidence} />
      ) : null}

      {submitError ? (
        <Alert variant="destructive">
          <AlertTitle>We couldn&apos;t create your report</AlertTitle>
          <AlertDescription>
            {submitError} Nothing you entered has been lost.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={goBack}
          disabled={step === 0 || isSubmitting}
        >
          <ArrowLeft aria-hidden="true" />
          Back
        </Button>

        {isLastStep ? (
          <div className="space-y-2 sm:text-right">
            <Button type="button" size="lg" onClick={submitReport} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Creating your case&hellip;
                </>
              ) : (
                "Create my case"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              This saves your report in CivicProof. It is not sent to any authority.
            </p>
          </div>
        ) : (
          <Button type="button" size="lg" onClick={goNext}>
            Continue
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
