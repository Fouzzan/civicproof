import { z } from "zod";

/**
 * The shape of a supported scheme.
 *
 * These types are the contract between the database row and everything that
 * reads it. Rules are parsed through the Zod schemas below on every read, so a
 * malformed row fails loudly at the boundary instead of silently producing a
 * wrong eligibility answer.
 */

/** What kind of answer a fact holds, and therefore how it is validated. */
export const factKindSchema = z.enum(["number", "boolean", "text"]);
export type FactKind = z.infer<typeof factKindSchema>;

/**
 * One piece of information the scheme needs.
 *
 * A fact may be needed for the eligibility decision, for the application form,
 * or both. Keeping one list rather than two means the agent can never ask for
 * something the scheme does not actually use.
 */
export const schemeFactSchema = z.object({
  id: z.string().min(1),
  kind: factKindSchema,
  /** Short noun phrase, used as a field label. */
  label: z.string().min(1),
  /** The plain-language question Sahayak asks when this fact is missing. */
  question: z.string().min(1),
  unit: z.string().optional(),
  /** Sanity bounds for numeric answers. Not eligibility rules. */
  min: z.number().optional(),
  max: z.number().optional(),
  forEligibility: z.boolean(),
  forApplication: z.boolean(),
});

export type SchemeFact = z.infer<typeof schemeFactSchema>;

/**
 * A single eligibility criterion.
 *
 * Deliberately a tiny closed vocabulary rather than an expression language:
 * every operator here can be evaluated in one line with no parsing, which is
 * what makes the result trustworthy and testable.
 */
const ruleBase = {
  id: z.string().min(1),
  /** Plain-language statement of the criterion, shown to the citizen. */
  label: z.string().min(1),
  fact: z.string().min(1),
  /** Shown when this criterion is the reason for a refusal. */
  failureHint: z.string().min(1),
};

export const eligibilityRuleSchema = z.discriminatedUnion("kind", [
  z.object({
    ...ruleBase,
    kind: z.literal("number"),
    op: z.enum(["gte", "lte", "gt", "lt"]),
    value: z.number(),
    unit: z.string().optional(),
  }),
  z.object({
    ...ruleBase,
    kind: z.literal("range"),
    min: z.number(),
    max: z.number(),
    unit: z.string().optional(),
  }),
  z.object({
    ...ruleBase,
    kind: z.literal("boolean"),
    expected: z.boolean(),
  }),
]);

export type EligibilityRule = z.infer<typeof eligibilityRuleSchema>;

/**
 * Citizen-service categories.
 *
 * A closed set rather than free text: the dashboard browses by category, and a
 * typo would silently create an eighth category nobody can find.
 */
export const schemeCategorySchema = z.enum([
  "EDUCATION",
  "EMPLOYMENT",
  "SENIOR_CITIZENS",
  "AGRICULTURE",
  "HOUSING",
  "ACCESSIBILITY",
]);

export type SchemeCategory = z.infer<typeof schemeCategorySchema>;

export const CATEGORY_LABEL: Record<SchemeCategory, string> = {
  EDUCATION: "Education",
  EMPLOYMENT: "Employment",
  SENIOR_CITIZENS: "Senior Citizens",
  AGRICULTURE: "Agriculture",
  HOUSING: "Housing",
  ACCESSIBILITY: "Accessibility",
};

export const schemeDefinitionSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  category: schemeCategorySchema,
  /** What the citizen actually receives, in plain words. */
  benefits: z.array(z.string().min(1)).min(1),
  /** Who this is for, for display and discovery context — never for eligibility. */
  targetGroups: z.array(z.string().min(1)).min(1),
  /**
   * What a real scheme of this kind would ask you to produce.
   *
   * INFORMATIONAL ONLY. Sahayak collects no documents, and the UI says so. The
   * list exists to set expectations honestly, not to gather anything.
   */
  requiredDocuments: z.array(z.string().min(1)),
  /** Where the demo rules came from. Always a demonstration label here. */
  sourceLabel: z.string().min(1),
  facts: z.array(schemeFactSchema).min(1),
  rules: z.array(eligibilityRuleSchema).min(1),
  isDemo: z.boolean(),
});

export type SchemeDefinition = z.infer<typeof schemeDefinitionSchema>;

/** A fact value as supplied by the citizen. */
export type FactValue = number | boolean | string;
export type CollectedFacts = Readonly<Record<string, FactValue>>;

export const collectedFactsSchema = z.record(
  z.string(),
  z.union([z.number(), z.boolean(), z.string()]),
);
