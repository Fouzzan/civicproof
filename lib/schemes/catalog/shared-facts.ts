import type { SchemeFact } from "@/lib/schemes/types";

/**
 * Facts several schemes need, defined once.
 *
 * Each scheme still carries its own fact list — a scheme should be readable on
 * its own — but the wording of a shared question comes from here so the same
 * thing is never asked two different ways across categories.
 *
 * DATA MINIMISATION: this is the complete vocabulary Sahayak may ask for. There
 * is deliberately no Aadhaar, PAN, bank detail, password or OTP anywhere in it,
 * so no scheme can request one even by accident (Docs/13 privacy principle).
 */
export const AGE: SchemeFact = {
  id: "age",
  kind: "number",
  label: "Age",
  question: "How old are you?",
  unit: "years",
  min: 0,
  max: 120,
  forEligibility: true,
  forApplication: true,
};

export const ANNUAL_INCOME: SchemeFact = {
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
};

/** Asked only once eligibility is settled — never to decide it. */
export const FULL_NAME: SchemeFact = {
  id: "fullName",
  kind: "text",
  label: "Full name",
  question: "What name should go on the application?",
  forEligibility: false,
  forApplication: true,
};

export const DISTRICT: SchemeFact = {
  id: "district",
  kind: "text",
  label: "District",
  question: "Which district do you live in?",
  forEligibility: false,
  forApplication: true,
};

/** The tail every scheme shares: identity-light application details. */
export const APPLICATION_FACTS: readonly SchemeFact[] = [FULL_NAME, DISTRICT];
