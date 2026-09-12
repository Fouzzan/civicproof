import { AGE, ANNUAL_INCOME, APPLICATION_FACTS } from "@/lib/schemes/catalog/shared-facts";
import type { SchemeDefinition } from "@/lib/schemes/types";

/** FICTIONAL demonstration scheme — Senior Citizens. */
export const SENIOR_CITIZEN_ASSISTANCE: SchemeDefinition = {
  slug: "senior-citizen-assistance",
  name: "Senior Citizen Assistance",
  category: "SENIOR_CITIZENS",
  summary:
    "A monthly support payment for older people on a low income who receive no pension.",
  benefits: [
    "A monthly support payment",
    "Priority access to a local community support worker",
  ],
  targetGroups: ["People aged 60 and over", "Older people without a pension"],
  requiredDocuments: ["Proof of age", "Proof of income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    AGE,
    ANNUAL_INCOME,
    {
      id: "receivesPension",
      kind: "boolean",
      label: "Receives a pension",
      question: "Do you currently receive a pension of any kind?",
      forEligibility: true,
      forApplication: true,
    },
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "senior-age",
      kind: "number",
      fact: "age",
      op: "gte",
      value: 60,
      unit: "years",
      label: "You are 60 or older",
      failureHint: "This demonstration scheme is for people aged 60 and over.",
    },
    {
      id: "senior-income-ceiling",
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
      id: "no-existing-pension",
      kind: "boolean",
      fact: "receivesPension",
      expected: false,
      label: "You do not already receive a pension",
      failureHint:
        "This demonstration scheme is for people who do not already receive a pension.",
    },
  ],
};

/**
 * FICTIONAL demonstration scheme — Senior Citizens (older band).
 *
 * Open to a higher income than Senior Citizen Assistance and does NOT exclude
 * people who already receive a pension, so the two cover different people
 * rather than competing for the same applicant.
 */
export const SENIOR_WELLBEING_ALLOWANCE: SchemeDefinition = {
  slug: "senior-wellbeing-allowance",
  name: "Senior Wellbeing Allowance",
  category: "SENIOR_CITIZENS",
  summary:
    "A contribution towards heating, transport and everyday costs for people aged 70 and over.",
  benefits: [
    "A seasonal allowance towards household costs",
    "A local transport concession",
  ],
  targetGroups: ["People aged 70 and over"],
  requiredDocuments: ["Proof of age", "Proof of income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [AGE, ANNUAL_INCOME, ...APPLICATION_FACTS],

  rules: [
    {
      id: "wellbeing-age",
      kind: "number",
      fact: "age",
      op: "gte",
      value: 70,
      unit: "years",
      label: "You are 70 or older",
      failureHint:
        "This demonstration scheme is for people aged 70 and over. Senior Citizen Assistance starts at 60.",
    },
    {
      id: "wellbeing-income-ceiling",
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
