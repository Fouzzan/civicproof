import { z } from "zod";

import { prisma } from "@/lib/db";
import {
  eligibilityRuleSchema,
  schemeCategorySchema,
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
 *
 * The DATABASE is authoritative, not lib/schemes/catalog. The catalogue seeds
 * these rows; once a change has been approved through Scheme Intelligence, the
 * stored version is what the engine uses.
 */

const storedSchemeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  category: schemeCategorySchema,
  benefits: z.array(z.string().min(1)),
  targetGroups: z.array(z.string().min(1)),
  requiredDocuments: z.array(z.string().min(1)),
  sourceLabel: z.string().min(1),
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

/** Stored provenance, kept beside the definition rather than inside it. */
export type SchemeProvenance = {
  readonly version: number;
  readonly lastUpdated: Date;
  readonly lastVerified: Date | null;
  readonly sourceLabel: string;
};

export type StoredScheme = {
  readonly definition: SchemeDefinition;
  readonly provenance: SchemeProvenance;
};

type SchemeRow = {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly category: string;
  readonly benefits: unknown;
  readonly targetGroups: unknown;
  readonly requiredDocuments: unknown;
  readonly sourceLabel: string;
  readonly isDemo: boolean;
  readonly eligibilityRules: unknown;
  readonly requiredFields: unknown;
  readonly version: number;
  readonly updatedAt: Date;
  readonly lastVerified: Date | null;
};

function toStored(row: SchemeRow): StoredScheme {
  const parsed = storedSchemeSchema.safeParse(row);

  if (!parsed.success) {
    throw new SchemeDataError(`Scheme "${row.slug}" has malformed data.`);
  }

  return {
    definition: {
      slug: parsed.data.slug,
      name: parsed.data.name,
      summary: parsed.data.summary,
      category: parsed.data.category,
      benefits: parsed.data.benefits,
      targetGroups: parsed.data.targetGroups,
      requiredDocuments: parsed.data.requiredDocuments,
      sourceLabel: parsed.data.sourceLabel,
      isDemo: parsed.data.isDemo,
      facts: parsed.data.requiredFields,
      rules: parsed.data.eligibilityRules,
    },
    provenance: {
      version: row.version,
      lastUpdated: row.updatedAt,
      lastVerified: row.lastVerified,
      sourceLabel: parsed.data.sourceLabel,
    },
  };
}

export async function listActiveSchemes(): Promise<readonly SchemeDefinition[]> {
  const stored = await listActiveStoredSchemes();

  return stored.map((entry) => entry.definition);
}

/** Definitions plus version/verification metadata, for display surfaces. */
export async function listActiveStoredSchemes(): Promise<readonly StoredScheme[]> {
  const rows = await prisma.scheme.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(toStored);
}

export async function getSchemeBySlug(slug: string): Promise<SchemeDefinition | null> {
  const row = await prisma.scheme.findFirst({ where: { slug, isActive: true } });

  return row ? toStored(row).definition : null;
}

export async function getStoredSchemeBySlug(slug: string): Promise<StoredScheme | null> {
  const row = await prisma.scheme.findFirst({ where: { slug, isActive: true } });

  return row ? toStored(row) : null;
}

/**
 * A stable description of which schemes are currently on offer.
 *
 * Deliberately the sorted list of active slugs and nothing else — not a hash,
 * so it is readable in the database, and not the rule contents, so a threshold
 * correction does not invalidate every conversation in progress. What makes an
 * old transcript actively misleading is a change in WHICH services exist, since
 * that is what discovery results claim.
 */
export async function getCatalogueFingerprint(): Promise<string> {
  const rows = await prisma.scheme.findMany({
    where: { isActive: true },
    select: { slug: true },
    orderBy: { slug: "asc" },
  });

  return rows.map((row) => row.slug).join(",");
}

/** The database id for a slug, needed when writing an Application. */
export async function getSchemeIdBySlug(slug: string): Promise<string | null> {
  const row = await prisma.scheme.findFirst({
    where: { slug, isActive: true },
    select: { id: true },
  });

  return row?.id ?? null;
}
