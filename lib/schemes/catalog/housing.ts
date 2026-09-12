import { ANNUAL_INCOME, APPLICATION_FACTS } from "@/lib/schemes/catalog/shared-facts";
import type { SchemeDefinition } from "@/lib/schemes/types";

/** FICTIONAL demonstration scheme — Housing. */
export const BASIC_HOUSING_ASSISTANCE: SchemeDefinition = {
  slug: "basic-housing-assistance",
  name: "Basic Housing Assistance",
  category: "HOUSING",
  summary:
    "Help with rent and essential repairs for households that do not own their home.",
  benefits: [
    "A monthly contribution towards rent",
    "A one-off grant for essential repairs",
  ],
  targetGroups: ["Households in rented or insecure housing", "Lower-income families"],
  requiredDocuments: ["Proof of current housing", "Proof of household income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    {
      id: "ownsHome",
      kind: "boolean",
      label: "Owns their home",
      question: "Do you own the home you live in?",
      forEligibility: true,
      forApplication: true,
    },
    {
      id: "householdSize",
      kind: "number",
      label: "People in the household",
      question: "How many people live in your household, including you?",
      unit: "people",
      min: 1,
      max: 30,
      forEligibility: true,
      forApplication: true,
    },
    ANNUAL_INCOME,
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "does-not-own-home",
      kind: "boolean",
      fact: "ownsHome",
      expected: false,
      label: "You do not own the home you live in",
      failureHint:
        "This demonstration scheme is for households that do not own their home.",
    },
    {
      id: "household-of-two-or-more",
      kind: "number",
      fact: "householdSize",
      op: "gte",
      value: 2,
      unit: "people",
      label: "There are 2 or more people in your household",
      failureHint: "This demonstration scheme is for households of two or more people.",
    },
    {
      id: "housing-income-ceiling",
      kind: "number",
      fact: "annualHouseholdIncome",
      op: "lte",
      value: 250000,
      unit: "₹ per year",
      label: "Your household income is ₹2,50,000 a year or less",
      failureHint:
        "This demonstration scheme is for households earning ₹2,50,000 or less per year.",
    },
  ],
};
