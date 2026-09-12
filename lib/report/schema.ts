import { z } from "zod";

import { INCIDENT_TYPE_VALUES } from "@/lib/report/incident-types";

/**
 * Validation for the citizen reporting flow.
 *
 * Shared deliberately: this runs in the browser now for form UX, and the same
 * schema is what the case-creation endpoint should validate against later.
 * Client-side validation is never the security boundary (Docs/13-SECURITY.md §7)
 * — the server must re-validate.
 *
 * Maximum lengths exist to prevent oversized requests and prompt-bloat.
 */
export const DESCRIPTION_MIN_LENGTH = 15;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const LOCATION_MAX_LENGTH = 300;
export const CONTEXT_MAX_LENGTH = 2000;

export const incidentTypeSchema = z.enum(INCIDENT_TYPE_VALUES);

export const incidentTypeStepSchema = z.object({
  incidentType: incidentTypeSchema,
});

export const incidentDetailsStepSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(DESCRIPTION_MIN_LENGTH, {
        message: `Please describe what happened in a little more detail (at least ${DESCRIPTION_MIN_LENGTH} characters).`,
      })
      .max(DESCRIPTION_MAX_LENGTH, {
        message: `Please keep the description under ${DESCRIPTION_MAX_LENGTH} characters.`,
      }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Enter a valid date." })
      .optional()
      .or(z.literal("")),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: "Enter a valid time." })
      .optional()
      .or(z.literal("")),
    location: z
      .string()
      .trim()
      .max(LOCATION_MAX_LENGTH, {
        message: `Please keep the location under ${LOCATION_MAX_LENGTH} characters.`,
      })
      .optional()
      .or(z.literal("")),
    additionalContext: z
      .string()
      .trim()
      .max(CONTEXT_MAX_LENGTH, {
        message: `Please keep the extra details under ${CONTEXT_MAX_LENGTH} characters.`,
      })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (value) => {
      if (!value.date) {
        return true;
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      return new Date(`${value.date}T00:00:00`) <= today;
    },
    {
      message: "The date cannot be in the future.",
      path: ["date"],
    },
  );

export const reportDraftSchema = incidentTypeStepSchema.and(incidentDetailsStepSchema);

export type IncidentDetailsInput = z.infer<typeof incidentDetailsStepSchema>;
export type ReportDraftInput = z.infer<typeof reportDraftSchema>;

/**
 * Flatten Zod issues into a field -> first message map for form rendering.
 */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((accumulator, issue) => {
    const field = issue.path[0];

    if (typeof field !== "string" || accumulator[field]) {
      return accumulator;
    }

    return { ...accumulator, [field]: issue.message };
  }, {});
}
