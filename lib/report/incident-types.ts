/**
 * The MVP incident categories (Docs/11-UI-UX.md §3).
 *
 * These are plain string values, NOT a Prisma enum: `Case.incidentType` stays a
 * String in the schema and is validated at the boundary instead. The category is
 * the broad type of problem; the specifics (a pothole, a blocked drain) belong in
 * the citizen's own description.
 */
export const INCIDENT_TYPE_VALUES = [
  "CIVIC_PROBLEM",
  "PUBLIC_SERVICE_PROBLEM",
  "SAFETY_HARASSMENT",
] as const;

export type IncidentTypeValue = (typeof INCIDENT_TYPE_VALUES)[number];

export type IncidentTypeDefinition = {
  readonly value: IncidentTypeValue;
  readonly label: string;
  readonly description: string;
  readonly examples: string;
  /** Sensitive categories are private by default (Docs/04-FEATURES.md F-015). */
  readonly sensitive: boolean;
};

export const INCIDENT_TYPES: readonly IncidentTypeDefinition[] = [
  {
    value: "CIVIC_PROBLEM",
    label: "Civic Problem",
    description: "Something in the physical environment that needs fixing.",
    examples: "Pothole, blocked drain, waterlogging, broken streetlight, damaged public property",
    sensitive: false,
  },
  {
    value: "PUBLIC_SERVICE_PROBLEM",
    label: "Public / Service Problem",
    description: "A public-facing service or institution is not working as it should.",
    examples: "Public transport, utilities, a government office, an institution",
    sensitive: false,
  },
  {
    value: "SAFETY_HARASSMENT",
    label: "Safety / Harassment",
    description: "Something that affected your safety or involved another person.",
    examples: "Harassment in a public place or public transport, stalking, threats",
    sensitive: true,
  },
] as const;

export function getIncidentType(
  value: IncidentTypeValue | null,
): IncidentTypeDefinition | null {
  return INCIDENT_TYPES.find((type) => type.value === value) ?? null;
}

/**
 * Sensitivity is derived from the category, never taken from the client.
 * The server re-derives this when the case is eventually created.
 */
export function isSensitiveIncidentType(value: IncidentTypeValue | null): boolean {
  return getIncidentType(value)?.sensitive ?? false;
}
