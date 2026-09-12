import { ANNUAL_INCOME, APPLICATION_FACTS } from "@/lib/schemes/catalog/shared-facts";
import type { SchemeDefinition } from "@/lib/schemes/types";

/**
 * FICTIONAL demonstration scheme — Agriculture.
 *
 * Land is measured in acres rather than hectares: it is the unit a smallholder
 * is most likely to use unprompted, and asking in the citizen's own units is
 * the difference between an answer and a guess.
 */
export const FARMER_INCOME_SUPPORT: SchemeDefinition = {
  slug: "farmer-income-support",
  name: "Farmer Income Support",
  category: "AGRICULTURE",
  summary:
    "Seasonal income support for small-scale farmers in lower-income households.",
  benefits: [
    "A seasonal income support payment",
    "Access to a subsidised crop advisory service",
  ],
  targetGroups: ["Small-scale farmers", "Lower-income farming households"],
  requiredDocuments: ["Proof of land cultivated", "Proof of household income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    {
      id: "isFarmer",
      kind: "boolean",
      label: "Works in farming",
      question: "Do you farm or cultivate land yourself?",
      forEligibility: true,
      forApplication: true,
    },
    {
      id: "landAcres",
      kind: "number",
      label: "Land cultivated",
      question: "About how much land do you cultivate, in acres? An estimate is fine.",
      unit: "acres",
      min: 0,
      max: 10000,
      forEligibility: true,
      forApplication: true,
    },
    ANNUAL_INCOME,
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "is-farmer",
      kind: "boolean",
      fact: "isFarmer",
      expected: true,
      label: "You farm or cultivate land",
      failureHint: "This demonstration scheme is for people who cultivate land.",
    },
    {
      id: "smallholding-acres",
      kind: "range",
      fact: "landAcres",
      min: 0.25,
      max: 5,
      unit: "acres",
      label: "You cultivate between 0.25 and 5 acres",
      failureHint:
        "This demonstration scheme is for small-scale farmers cultivating between 0.25 and 5 acres.",
    },
    {
      id: "farmer-income-ceiling",
      kind: "number",
      fact: "annualHouseholdIncome",
      op: "lte",
      value: 200000,
      unit: "₹ per year",
      label: "Your household income is ₹2,00,000 a year or less",
      failureHint:
        "This demonstration scheme is for households earning ₹2,00,000 or less per year.",
    },
  ],
};

/**
 * FICTIONAL demonstration scheme — Agriculture (crop protection).
 *
 * A wider land range and a higher income ceiling than Farmer Income Support, so
 * a farmer just outside the smallholder band still has somewhere to go rather
 * than being told they do not qualify and left there.
 */
export const CROP_PROTECTION_SUPPORT: SchemeDefinition = {
  slug: "crop-protection-support",
  name: "Crop Protection Support",
  category: "AGRICULTURE",
  summary:
    "Help with the cost of protecting a harvest against weather and crop loss.",
  benefits: [
    "A subsidised crop protection plan",
    "Access to an advisory line during the growing season",
  ],
  targetGroups: ["Farmers of small and medium holdings"],
  requiredDocuments: ["Proof of land cultivated", "Proof of household income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    {
      id: "isFarmer",
      kind: "boolean",
      label: "Works in farming",
      question: "Do you farm or cultivate land yourself?",
      forEligibility: true,
      forApplication: true,
    },
    {
      id: "landAcres",
      kind: "number",
      label: "Land cultivated",
      question: "About how much land do you cultivate, in acres? An estimate is fine.",
      unit: "acres",
      min: 0,
      max: 10000,
      forEligibility: true,
      forApplication: true,
    },
    ANNUAL_INCOME,
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "protection-is-farmer",
      kind: "boolean",
      fact: "isFarmer",
      expected: true,
      label: "You farm or cultivate land",
      failureHint: "This demonstration scheme is for people who cultivate land.",
    },
    {
      id: "protection-land-range",
      kind: "range",
      fact: "landAcres",
      min: 0.5,
      max: 10,
      unit: "acres",
      label: "You cultivate between 0.5 and 10 acres",
      failureHint:
        "This demonstration scheme is for holdings between 0.5 and 10 acres.",
    },
    {
      id: "protection-income-ceiling",
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
