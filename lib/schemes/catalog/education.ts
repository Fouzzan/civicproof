import { AGE, ANNUAL_INCOME, APPLICATION_FACTS } from "@/lib/schemes/catalog/shared-facts";
import type { SchemeDefinition } from "@/lib/schemes/types";

/**
 * FICTIONAL demonstration scheme — Education.
 *
 * Not a real programme. Its thresholds are invented, and every surface that
 * renders it shows a DEMO label. Presenting invented numbers as the criteria of
 * a real entitlement could lead someone to believe they do or do not qualify
 * for support they actually need.
 */
export const STUDENT_EDUCATION_ASSISTANCE: SchemeDefinition = {
  slug: "student-education-assistance",
  name: "Student Education Assistance",
  category: "EDUCATION",
  summary:
    "Support with course and living costs for students from lower-income households.",
  benefits: [
    "A termly allowance towards course fees",
    "A one-off grant for books and study materials",
  ],
  targetGroups: ["Students in full-time education", "Lower-income households"],
  requiredDocuments: ["Proof of enrolment", "Proof of household income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    {
      id: "isStudent",
      kind: "boolean",
      label: "Currently studying",
      question: "Are you currently studying — school, college or a training course?",
      forEligibility: true,
      forApplication: true,
    },
    AGE,
    ANNUAL_INCOME,
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "is-student",
      kind: "boolean",
      fact: "isStudent",
      expected: true,
      label: "You are currently studying",
      failureHint:
        "This demonstration scheme is for people currently in education or training.",
    },
    {
      id: "student-age-range",
      kind: "range",
      fact: "age",
      min: 17,
      max: 30,
      unit: "years",
      label: "You are between 17 and 30",
      failureHint: "This demonstration scheme is for students aged 17 to 30.",
    },
    {
      id: "student-income-ceiling",
      kind: "number",
      fact: "annualHouseholdIncome",
      op: "lte",
      value: 300_000,
      unit: "₹ per year",
      label: "Your household income is ₹3,00,000 a year or less",
      failureHint:
        "This demonstration scheme is for households earning ₹3,00,000 or less per year.",
    },
  ],
};
