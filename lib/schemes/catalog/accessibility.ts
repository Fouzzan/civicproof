import { AGE, ANNUAL_INCOME, APPLICATION_FACTS } from "@/lib/schemes/catalog/shared-facts";
import type { SchemeDefinition } from "@/lib/schemes/types";

/**
 * FICTIONAL demonstration scheme — Accessibility.
 *
 * The disability question is a single yes/no and asks for no detail, diagnosis
 * or documentation. A demonstration has no business collecting someone's
 * medical history to show a workflow.
 */
export const ACCESSIBILITY_SUPPORT: SchemeDefinition = {
  slug: "accessibility-support",
  name: "Accessibility Support",
  category: "ACCESSIBILITY",
  summary: "Help with assistive equipment and home adaptations for disabled people.",
  benefits: [
    "A grant towards assistive equipment",
    "An assessment for home adaptations",
  ],
  targetGroups: ["Disabled people", "People needing assistive equipment"],
  requiredDocuments: ["Proof of income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    {
      id: "hasDisability",
      kind: "boolean",
      label: "Has a disability",
      question:
        "Do you have a disability or long-term condition that affects daily life? A simple yes or no is enough.",
      forEligibility: true,
      forApplication: true,
    },
    AGE,
    ANNUAL_INCOME,
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "has-disability",
      kind: "boolean",
      fact: "hasDisability",
      expected: true,
      label: "You have a disability or long-term condition",
      failureHint:
        "This demonstration scheme is for disabled people and people with a long-term condition.",
    },
    {
      id: "accessibility-minimum-age",
      kind: "number",
      fact: "age",
      op: "gte",
      value: 5,
      unit: "years",
      label: "You are 5 or older",
      failureHint: "This demonstration scheme is for applicants aged 5 and over.",
    },
    {
      id: "accessibility-income-ceiling",
      kind: "number",
      fact: "annualHouseholdIncome",
      op: "lte",
      value: 300000,
      unit: "₹ per year",
      label: "Your household income is ₹3,00,000 a year or less",
      failureHint:
        "This demonstration scheme is for households earning ₹3,00,000 or less per year.",
    },
  ],
};
