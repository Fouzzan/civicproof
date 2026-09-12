import { AGE, ANNUAL_INCOME, APPLICATION_FACTS } from "@/lib/schemes/catalog/shared-facts";
import type { SchemeDefinition } from "@/lib/schemes/types";

/** FICTIONAL demonstration scheme — Employment. */
export const JOB_SEEKER_SUPPORT: SchemeDefinition = {
  slug: "job-seeker-support",
  name: "Job Seeker Support",
  category: "EMPLOYMENT",
  summary:
    "A temporary allowance and training referral for people actively looking for work.",
  benefits: [
    "A monthly allowance while you look for work",
    "A referral to a local skills or training programme",
  ],
  targetGroups: ["People recently out of work", "People actively seeking employment"],
  requiredDocuments: ["Proof of previous employment, if you have it", "Proof of income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    {
      id: "isSeekingWork",
      kind: "boolean",
      label: "Looking for work",
      question: "Are you currently out of work and looking for a job?",
      forEligibility: true,
      forApplication: true,
    },
    AGE,
    ANNUAL_INCOME,
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "is-seeking-work",
      kind: "boolean",
      fact: "isSeekingWork",
      expected: true,
      label: "You are out of work and looking for a job",
      failureHint:
        "This demonstration scheme is for people who are currently looking for work.",
    },
    {
      id: "working-age",
      kind: "range",
      fact: "age",
      min: 18,
      max: 60,
      unit: "years",
      label: "You are between 18 and 60",
      failureHint: "This demonstration scheme is for people aged 18 to 60.",
    },
    {
      id: "jobseeker-income-ceiling",
      kind: "number",
      fact: "annualHouseholdIncome",
      op: "lte",
      value: 250_000,
      unit: "₹ per year",
      label: "Your household income is ₹2,50,000 a year or less",
      failureHint:
        "This demonstration scheme is for households earning ₹2,50,000 or less per year.",
    },
  ],
};
