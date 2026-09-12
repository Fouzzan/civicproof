"use client";

import { ApplicationCard } from "@/components/cards/application-card";
import { EligibilityCard } from "@/components/cards/eligibility-card";
import { ErrorCard } from "@/components/cards/error-card";
import { SchemeCard } from "@/components/cards/scheme-card";
import { StatusCard } from "@/components/cards/status-card";
import { SubmissionCard } from "@/components/cards/submission-card";
import type { ApplicationView, EligibilityView, SchemeView } from "@/lib/agent/cards";

/**
 * Every inline card, with mock data, on one page.
 *
 * A development aid for checking states that are awkward to reach by
 * conversation — an ineligible result, a half-filled application, a provider
 * failure. The data here is obviously fake and never leaves this page.
 */
const SCHEME: SchemeView = {
  slug: "demo-farmer-income-support",
  name: "Demo Farmer Income Support",
  summary:
    "A demonstration scheme offering income support to small-scale farmers in low-income households.",
  isDemo: true,
  criteria: [
    "You are 18 or older",
    "Your household income is ₹2,00,000 a year or less",
    "You cultivate between 0.1 and 2 hectares of farmland",
    "You live in the state where you are applying",
  ],
};

const eligible: EligibilityView = {
  outcome: "LIKELY_ELIGIBLE",
  schemeName: SCHEME.name,
  isDemo: true,
  criteria: [
    { id: "minimum-age", label: "You are 18 or older", status: "PASSED", failureHint: null },
    {
      id: "income-ceiling",
      label: "Your household income is ₹2,00,000 a year or less",
      status: "PASSED",
      failureHint: null,
    },
    {
      id: "smallholding",
      label: "You cultivate between 0.1 and 2 hectares of farmland",
      status: "PASSED",
      failureHint: null,
    },
    {
      id: "state-residency",
      label: "You live in the state where you are applying",
      status: "PASSED",
      failureHint: null,
    },
  ],
};

const ineligible: EligibilityView = {
  ...eligible,
  outcome: "NOT_ELIGIBLE",
  criteria: [
    eligible.criteria[0]!,
    {
      id: "income-ceiling",
      label: "Your household income is ₹2,00,000 a year or less",
      status: "FAILED",
      failureHint:
        "This demonstration scheme is for households earning ₹2,00,000 or less per year.",
    },
    eligible.criteria[2]!,
    eligible.criteria[3]!,
  ],
};

const incomplete: EligibilityView = {
  ...eligible,
  outcome: "MORE_INFORMATION_NEEDED",
  criteria: [
    eligible.criteria[0]!,
    eligible.criteria[1]!,
    {
      id: "smallholding",
      label: "You cultivate between 0.1 and 2 hectares of farmland",
      status: "UNKNOWN",
      failureHint: null,
    },
    {
      id: "state-residency",
      label: "You live in the state where you are applying",
      status: "UNKNOWN",
      failureHint: null,
    },
  ],
};

const readyApplication: ApplicationView = {
  applicationId: "preview-application",
  schemeName: SCHEME.name,
  isDemo: true,
  readyToConfirm: true,
  fields: [
    { id: "fullName", label: "Full name", kind: "text", value: "A. Kumar" },
    { id: "age", label: "Age", kind: "number", unit: "years", value: 62 },
    {
      id: "annualHouseholdIncome",
      label: "Annual household income",
      kind: "number",
      unit: "₹ per year",
      value: 90000,
    },
    {
      id: "landHectares",
      label: "Farmland cultivated",
      kind: "number",
      unit: "hectares",
      value: 1.2,
    },
    { id: "isStateResident", label: "State residency", kind: "boolean", value: true },
    { id: "district", label: "District", kind: "text", value: "Malappuram" },
  ],
};

const partialApplication: ApplicationView = {
  ...readyApplication,
  applicationId: "preview-partial",
  readyToConfirm: false,
  fields: readyApplication.fields.map((field) =>
    field.id === "district" ? { ...field, value: null } : field,
  ),
};

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CardPreview() {
  const noop = () => undefined;

  return (
    <div className="space-y-10 py-10">
      <Section title="Scheme">
        <SchemeCard schemes={[SCHEME]} />
      </Section>

      <Section title="Eligibility — likely eligible">
        <EligibilityCard eligibility={eligible} />
      </Section>

      <Section title="Eligibility — not eligible">
        <EligibilityCard eligibility={ineligible} />
      </Section>

      <Section title="Eligibility — more information needed">
        <EligibilityCard eligibility={incomplete} />
      </Section>

      <Section title="Application — ready to confirm">
        <ApplicationCard application={readyApplication} onConfirmed={noop} disabled />
      </Section>

      <Section title="Application — still incomplete">
        <ApplicationCard application={partialApplication} onConfirmed={noop} disabled />
      </Section>

      <Section title="Submission / tracking">
        <SubmissionCard
          submission={{
            trackingId: "DEMO-482913",
            schemeName: SCHEME.name,
            status: "SUBMITTED",
            submittedAt: new Date("2026-09-12T10:30:00Z").toISOString(),
            simulated: true,
            disclosure:
              "This application was recorded in the Sahayak demonstration system only. It has NOT been sent to any real government department.",
          }}
        />
      </Section>

      <Section title="Status">
        <StatusCard
          status={{
            trackingId: "DEMO-482913",
            schemeName: SCHEME.name,
            status: "UNDER_REVIEW",
            submittedAt: new Date("2026-09-12T10:30:00Z").toISOString(),
            simulated: true,
          }}
        />
      </Section>

      <Section title="Error">
        <ErrorCard message="I could not reach my assistant just now. Your answers are safe — please try again." />
      </Section>

      <Section title="Superseded (how a correction reads)">
        <div className="relative">
          <div className="pointer-events-none opacity-45 grayscale">
            <EligibilityCard eligibility={ineligible} />
          </div>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
            Updated further down after your change.
          </p>
        </div>
      </Section>
    </div>
  );
}
