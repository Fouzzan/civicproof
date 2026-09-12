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

/**
 * FICTIONAL demonstration scheme — Employment (training route).
 *
 * A wider income ceiling but a narrower age band than Job Seeker Support, so
 * the two genuinely separate: someone at 55 on a low income gets the first,
 * someone at 30 on a middling income gets this one.
 */
export const SKILL_TRAINING_GRANT: SchemeDefinition = {
  slug: "skill-training-grant",
  name: "Skill Training Grant",
  category: "EMPLOYMENT",
  summary:
    "A grant towards a recognised training course for people moving into new work.",
  benefits: [
    "Course fees for an approved training programme",
    "A travel allowance while you train",
  ],
  targetGroups: ["People retraining for new work", "Working-age jobseekers"],
  requiredDocuments: ["Proof of income", "Course enrolment details, once chosen"],
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
      id: "training-seeking-work",
      kind: "boolean",
      fact: "isSeekingWork",
      expected: true,
      label: "You are looking for work",
      failureHint:
        "This demonstration scheme is for people currently looking for work or retraining.",
    },
    {
      id: "training-age-range",
      kind: "range",
      fact: "age",
      min: 18,
      max: 45,
      unit: "years",
      label: "You are between 18 and 45",
      failureHint:
        "This demonstration training grant is for applicants aged 18 to 45. Job Seeker Support has a wider age range.",
    },
    {
      id: "training-income-ceiling",
      kind: "number",
      fact: "annualHouseholdIncome",
      op: "lte",
      value: 400000,
      unit: "₹ per year",
      label: "Your household income is ₹4,00,000 a year or less",
      failureHint:
        "This demonstration scheme is for households earning ₹4,00,000 or less per year.",
    },
  ],
};
