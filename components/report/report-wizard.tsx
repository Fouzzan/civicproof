"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";

import type { AiAnalysisView } from "@/components/case/ai-analysis-card";
import {
  ImmediateSafetyGuidance,
  PrivateReportNotice,
} from "@/components/report/safety-notice";
import { StepAiReview } from "@/components/report/step-ai-review";
import { StepConfirm } from "@/components/report/step-confirm";
import { StepEvidence } from "@/components/report/step-evidence";
import {
  StepIncidentDetails,
  type IncidentDetailsValues,
} from "@/components/report/step-incident-details";
import { StepIncidentType } from "@/components/report/step-incident-type";
import { StepIndicator } from "@/components/report/step-indicator";
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

const STEPS = ["Type", "Details", "Evidence", "AI review", "Confirm"] as const;
const STEP_TYPE = 0;
const STEP_DETAILS = 1;
const STEP_EVIDENCE = 2;
const STEP_REVIEW = 3;
const STEP_CONFIRM = 4;

type AnalysisStatus = "idle" | "loading" | "ready" | "failed";
type FilingPhase = "idle" | "creating" | "uploading" | "evidence-failed";

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
 * The order matters: the report is analysed BEFORE anything is written, so a
 * citizen who abandons the flow leaves no half-finished case behind, and nobody
 * files a report without first seeing what CivicProof made of it.
 *
 * Evidence stays in the browser until the case exists, which avoids orphaned
 * uploads for reports that are never filed.
 */
export function ReportWizard() {
  const [step, setStep] = useState(0);
  const [incidentType, setIncidentType] = useState<IncidentTypeValue | null>(null);
  const [details, setDetails] = useState<IncidentDetailsValues>(EMPTY_DETAILS);
  const [evidence, setEvidence] = useState<readonly SelectedEvidence[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evidenceError, setEvidenceError] = useState<string | undefined>();

  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysis, setAnalysis] = useState<AiAnalysisView | null>(null);
  const [analysisToken, setAnalysisToken] = useState<string | null>(null);
  const [imagesAnalysed, setImagesAnalysed] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | undefined>();

  const [phase, setPhase] = useState<FilingPhase>("idle");
  const [filingError, setFilingError] = useState<string | undefined>();
  const [createdCaseId, setCreatedCaseId] = useState<string | undefined>();
  const [failedEvidence, setFailedEvidence] = useState<readonly SelectedEvidence[]>([]);

  const router = useRouter();
  const isSensitive = isSensitiveIncidentType(incidentType);
  const isBusy = phase === "creating" || phase === "uploading";

  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const updateDetail = useCallback(
    (field: keyof IncidentDetailsValues, value: string) => {
      setDetails((current) => ({ ...current, [field]: value }));
      setErrors((current) =>
        current[field]
          ? Object.fromEntries(Object.entries(current).filter(([key]) => key !== field))
          : current,
      );
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

        const previewUrl = URL.createObjectURL(file);
        objectUrls.current.push(previewUrl);
        accepted.push({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl,
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

  /**
   * Ask the server to review the draft. Nothing is persisted by this call.
   * Sensitive reports send no photos - the server enforces that independently.
   */
  const runAnalysis = useCallback(async () => {
    setAnalysisStatus("loading");
    setAnalysisError(undefined);

    try {
      const form = new FormData();
      form.append(
        "report",
        JSON.stringify({
          incidentType,
          description: details.description,
          date: details.date,
          time: details.time,
          location: details.location,
          additionalContext: details.additionalContext,
        }),
      );

      if (!isSensitive) {
        evidence.forEach((item) => form.append("images", item.file));
      }

      const response = await fetch("/api/report/analysis", {
        method: "POST",
        body: form,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setAnalysisError(
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error: unknown }).error)
            : "AI review is temporarily unavailable.",
        );
        setAnalysisStatus("failed");
        return;
      }

      const data = payload as {
        analysis?: AiAnalysisView;
        analysisToken?: string;
        imagesAnalysed?: number;
      };

      if (!data.analysis || !data.analysisToken) {
        setAnalysisError("The review came back incomplete.");
        setAnalysisStatus("failed");
        return;
      }

      setAnalysis(data.analysis);
      setAnalysisToken(data.analysisToken);
      setImagesAnalysed(data.imagesAnalysed ?? 0);
      setAnalysisStatus("ready");
    } catch {
      setAnalysisError("We couldn't reach CivicProof to review your report.");
      setAnalysisStatus("failed");
    }
  }, [details, incidentType, evidence, isSensitive]);

  async function uploadEvidence(
    caseId: string,
    items: readonly SelectedEvidence[],
  ): Promise<readonly SelectedEvidence[]> {
    const failed: SelectedEvidence[] = [];

    for (const item of items) {
      try {
        const form = new FormData();
        form.append("file", item.file);

        const response = await fetch(`/api/cases/${caseId}/evidence`, {
          method: "POST",
          body: form,
        });

        if (!response.ok) {
          failed.push(item);
        }
      } catch {
        failed.push(item);
      }
    }

    return failed;
  }

  async function retryEvidenceUpload() {
    if (!createdCaseId || failedEvidence.length === 0) {
      return;
    }

    setPhase("uploading");
    const stillFailed = await uploadEvidence(createdCaseId, failedEvidence);

    if (stillFailed.length > 0) {
      setFailedEvidence(stillFailed);
      setPhase("evidence-failed");
      return;
    }

    router.push(`/report/created/${createdCaseId}`);
  }

  /**
   * Create the case. This is the first and only write in the whole flow.
   */
  async function fileReport() {
    if (phase !== "idle") {
      return;
    }

    setPhase("creating");
    setFilingError(undefined);

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The analysis travels with its signature; the server re-verifies it and
        // ignores anything that does not match.
        body: JSON.stringify({
          incidentType,
          description: details.description,
          date: details.date,
          time: details.time,
          location: details.location,
          additionalContext: details.additionalContext,
          ...(analysis && analysisToken ? { analysis, analysisToken } : {}),
        }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setFilingError(
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error: unknown }).error)
            : "We couldn't file your report. Please try again.",
        );
        setPhase("idle");
        return;
      }

      const caseId = (payload as { case?: { caseId?: string } })?.case?.caseId;

      if (!caseId) {
        setFilingError("Your report was filed but no reference came back.");
        setPhase("idle");
        return;
      }

      setCreatedCaseId(caseId);

      if (evidence.length > 0) {
        setPhase("uploading");
        const failed = await uploadEvidence(caseId, evidence);

        if (failed.length > 0) {
          setFailedEvidence(failed);
          setPhase("evidence-failed");
          return;
        }
      }

      router.push(`/report/created/${caseId}`);
    } catch {
      setFilingError(
        "We couldn't reach CivicProof. Check your connection - your answers are still here.",
      );
      setPhase("idle");
    }
  }

  function goNext() {
    if (step === STEP_TYPE) {
      if (!incidentTypeStepSchema.safeParse({ incidentType }).success) {
        setErrors({ incidentType: "Choose the kind of problem you are reporting." });
        return;
      }
    }

    if (step === STEP_DETAILS) {
      const result = incidentDetailsStepSchema.safeParse(details);

      if (!result.success) {
        setErrors(fieldErrorsFrom(result.error));
        return;
      }
    }

    setErrors({});

    // Entering the review step kicks off the analysis automatically.
    if (step === STEP_EVIDENCE) {
      void runAnalysis();
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  const showSafety = isSensitive && step <= STEP_REVIEW;

  return (
    <div className="space-y-7">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {showSafety ? (
        <div className="space-y-3">
          <ImmediateSafetyGuidance />
          <PrivateReportNotice />
        </div>
      ) : null}

      {/*
        Keyed on the step so each screen animates in on its own, rather than the
        new content cross-fading inside the previous screen's layout.
      */}
      <div
        key={step}
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {step === STEP_TYPE ? (
          <StepIncidentType
            value={incidentType}
            onChange={(value) => {
              setIncidentType(value);
              setErrors({});
            }}
            error={errors.incidentType}
          />
        ) : null}

        {step === STEP_DETAILS ? (
          <StepIncidentDetails values={details} onChange={updateDetail} errors={errors} />
        ) : null}

        {step === STEP_EVIDENCE ? (
          <StepEvidence
            evidence={evidence}
            onAdd={addEvidence}
            onRemove={removeEvidence}
            error={evidenceError}
            isSensitive={isSensitive}
          />
        ) : null}

        {step === STEP_REVIEW ? (
          <StepAiReview
            status={analysisStatus === "idle" ? "loading" : analysisStatus}
            analysis={analysis}
            error={analysisError}
            originalDescription={details.description}
            evidence={evidence}
            isSensitive={isSensitive}
            imagesAnalysed={imagesAnalysed}
            onRetry={() => void runAnalysis()}
            onEditReport={() => setStep(STEP_DETAILS)}
          />
        ) : null}

        {step === STEP_CONFIRM ? (
          <StepConfirm
            incidentType={incidentType}
            details={details}
            evidence={evidence}
            analysis={analysis}
          />
        ) : null}
      </div>

      {phase === "evidence-failed" && createdCaseId ? (
        <Alert>
          <AlertTitle>
            Your case was filed &mdash; but the photos were not attached
          </AlertTitle>
          <AlertDescription>
            <span className="block">
              Case <span className="font-mono font-medium">{createdCaseId}</span> is
              saved. {failedEvidence.length} photo
              {failedEvidence.length === 1 ? "" : "s"} could not be uploaded.
            </span>
            <span className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={retryEvidenceUpload}>
                Try uploading again
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/report/created/${createdCaseId}`)}
              >
                Continue without photos
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      ) : null}

      {filingError ? (
        <Alert variant="destructive">
          <AlertTitle>We couldn&apos;t file your report</AlertTitle>
          <AlertDescription>
            {filingError} Nothing you entered has been lost.
          </AlertDescription>
        </Alert>
      ) : null}

      <div
        className="flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between"
        hidden={phase === "evidence-failed"}
      >
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={goBack}
          disabled={step === STEP_TYPE || isBusy}
        >
          <ArrowLeft aria-hidden="true" />
          Back
        </Button>

        {step === STEP_CONFIRM ? (
          <div className="space-y-2 sm:text-right">
            <Button
              type="button"
              size="xl"
              onClick={fileReport}
              disabled={isBusy}
              className="w-full sm:w-auto"
            >
              {isBusy ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  {phase === "uploading"
                    ? "Uploading photos…"
                    : "Filing your report…"}
                </>
              ) : (
                <>
                  <Send aria-hidden="true" />
                  File my report
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Saved to CivicProof. Not sent to any authority.
            </p>
          </div>
        ) : (
          <Button
            type="button"
            size="xl"
            onClick={goNext}
            disabled={step === STEP_REVIEW && analysisStatus === "loading"}
            className="w-full sm:w-auto"
          >
            {step === STEP_REVIEW
              ? analysisStatus === "failed"
                ? "Continue without AI"
                : "Accept & continue"
              : "Continue"}
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
