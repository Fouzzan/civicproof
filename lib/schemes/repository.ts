import { z } from "zod";

import { prisma } from "@/lib/db";
import {
  eligibilityRuleSchema,
  schemeFactSchema,
  type SchemeDefinition,
} from "@/lib/schemes/types";

/**
 * Read access to supported schemes.
 *
 * Rows are validated on every read. A scheme whose stored rules do not parse is
 * treated as unavailable rather than partially applied — better to tell the
 * citizen the service is unavailable than to evaluate them against half a rule
 * set.
 */

const storedSchemeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  isDemo: z.boolean(),
  requiredFields: z.array(schemeFactSchema).min(1),
  eligibilityRules: z.array(eligibilityRuleSchema).min(1),
});

export class SchemeDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemeDataError";
  }
}

type SchemeRow = {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly isDemo: boolean;
  readonly eligibilityRules: unknown;
  readonly requiredFields: unknown;
};

function toDefinition(row: SchemeRow): SchemeDefinition {
  const parsed = storedSchemeSchema.safeParse(row);

  if (!parsed.success) {
    throw new SchemeDataError(`Scheme "${row.slug}" has malformed rule data.`);
  }

  return {
    slug: parsed.data.slug,
    name: parsed.data.name,
    summary: parsed.data.summary,
    isDemo: parsed.data.isDemo,
    facts: parsed.data.requiredFields,
    rules: parsed.data.eligibilityRules,
  };
}

export async function listActiveSchemes(): Promise<readonly SchemeDefinition[]> {
  const rows = await prisma.scheme.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(toDefinition);
}

export async function getSchemeBySlug(slug: string): Promise<SchemeDefinition | null> {
  const row = await prisma.scheme.findFirst({ where: { slug, isActive: true } });

  return row ? toDefinition(row) : null;
}

/** The database id for a slug, needed when writing an Application. */
export async function getSchemeIdBySlug(slug: string): Promise<string | null> {
  const row = await prisma.scheme.findFirst({
    where: { slug, isActive: true },
    select: { id: true },
  });

  return row?.id ?? null;
}
