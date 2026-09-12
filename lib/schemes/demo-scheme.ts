import type { SchemeDefinition } from "@/lib/schemes/types";

/**
 * The single demonstration scheme for the MVP.
 *
 * THIS SCHEME IS FICTIONAL.
 *
 * It is not a real government programme and its thresholds are invented. That
 * is a deliberate safety decision, not a shortcut: presenting invented numbers
 * as the criteria of a real entitlement could lead someone to believe they do
 * or do not qualify for support they actually need (Docs/05-MVP.md §2.1).
 *
 * Everything that renders a scheme reads `isDemo` and labels it accordingly, so
 * no screen can show these rules without saying they are a demonstration.
 *
 * Four criteria, chosen so each exercises a different rule kind: a lower bound,
 * an upper bound, a range, and a boolean.
 */
export const DEMO_SCHEME: SchemeDefinition = {
  slug: "demo-farmer-income-support",
  name: "Demo Farmer Income Support",
  summary:
    "A demonstration scheme offering income support to small-scale farmers in low-income households.",
  isDemo: true,

  facts: [
    {
      id: "age",
      kind: "number",
      label: "Age",
      question: "How old are you?",
      unit: "years",
      min: 0,
      max: 120,
      forEligibility: true,
      forApplication: true,
    },
    {
      id: "annualHouseholdIncome",
      kind: "number",
      label: "Annual household income",
      question:
        "Roughly what is your household's total income in a year, in rupees? An approximate figure is fine.",
      unit: "₹ per year",
      min: 0,
      max: 100_000_000,
      forEligibility: true,
      forApplication: true,
    },
    {
      id: "landHectares",
      kind: "number",
      label: "Farmland cultivated",
      question:
        "About how much farmland do you cultivate, in hectares? If you are not sure, an estimate is fine.",
      unit: "hectares",
      min: 0,
      max: 10_000,
      forEligibility: true,
      forApplication: true,
    },
    {
      id: "isStateResident",
      kind: "boolean",
      label: "State residency",
      question: "Do you live in the state where you are applying?",
      forEligibility: true,
      forApplication: true,
    },
    {
      id: "fullName",
      kind: "text",
      label: "Full name",
      question: "What name should go on the application?",
      forEligibility: false,
      forApplication: true,
    },
    {
      id: "district",
      kind: "text",
      label: "District",
      question: "Which district do you live in?",
      forEligibility: false,
      forApplication: true,
    },
  ],

  rules: [
    {
      id: "minimum-age",
      kind: "number",
      fact: "age",
      op: "gte",
      value: 18,
      unit: "years",
      label: "You are 18 or older",
      failureHint: "This demonstration scheme is only open to applicants aged 18 or over.",
    },
    {
      id: "income-ceiling",
      kind: "number",
      fact: "annualHouseholdIncome",
      op: "lte",
      value: 200_000,
      unit: "₹ per year",
      label: "Your household income is ₹2,00,000 a year or less",
      failureHint:
        "This demonstration scheme is for households earning ₹2,00,000 or less per year.",
    },
    {
      id: "smallholding",
      kind: "range",
      fact: "landHectares",
      min: 0.1,
      max: 2,
      unit: "hectares",
      label: "You cultivate between 0.1 and 2 hectares of farmland",
      failureHint:
        "This demonstration scheme is for small-scale farmers cultivating between 0.1 and 2 hectares.",
    },
    {
      id: "state-residency",
      kind: "boolean",
      fact: "isStateResident",
      expected: true,
      label: "You live in the state where you are applying",
      failureHint:
        "This demonstration scheme is only open to residents of the state where the application is made.",
    },
  ],
};
