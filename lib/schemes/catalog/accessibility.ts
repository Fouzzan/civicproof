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

/**
 * FICTIONAL demonstration scheme — Accessibility (carers).
 *
 * Aimed at the person doing the caring rather than the person being cared for,
 * which is why it introduces its own fact. Someone describing a household
 * situation may qualify here even when they do not qualify for Accessibility
 * Support themselves.
 */
export const CAREGIVER_SUPPORT_ALLOWANCE: SchemeDefinition = {
  slug: "caregiver-support-allowance",
  name: "Caregiver Support Allowance",
  category: "ACCESSIBILITY",
  summary:
    "Regular support for people providing unpaid care to a disabled family member.",
  benefits: [
    "A monthly allowance recognising unpaid care",
    "Access to a respite care referral",
  ],
  targetGroups: ["Unpaid family carers"],
  requiredDocuments: ["Proof of income"],
  sourceLabel: "Sahayak demonstration catalogue (fictional)",
  isDemo: true,

  facts: [
    {
      id: "isCaregiver",
      kind: "boolean",
      label: "Cares for someone",
      question:
        "Do you regularly care for a family member who has a disability or long-term condition, without being paid for it?",
      forEligibility: true,
      forApplication: true,
    },
    AGE,
    ANNUAL_INCOME,
    ...APPLICATION_FACTS,
  ],

  rules: [
    {
      id: "is-caregiver",
      kind: "boolean",
      fact: "isCaregiver",
      expected: true,
      label: "You provide unpaid care to a family member",
      failureHint:
        "This demonstration scheme is for people providing unpaid care. If you are the person needing support, Accessibility Support may fit instead.",
    },
    {
      id: "caregiver-minimum-age",
      kind: "number",
      fact: "age",
      op: "gte",
      value: 18,
      unit: "years",
      label: "You are 18 or older",
      failureHint: "This demonstration scheme is for carers aged 18 and over.",
    },
    {
      id: "caregiver-income-ceiling",
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
