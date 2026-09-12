import {
  ACCESSIBILITY_SUPPORT,
  CAREGIVER_SUPPORT_ALLOWANCE,
} from "@/lib/schemes/catalog/accessibility";
import {
  CROP_PROTECTION_SUPPORT,
  FARMER_INCOME_SUPPORT,
} from "@/lib/schemes/catalog/agriculture";
import {
  SCHOOL_STUDENT_SUPPORT,
  STUDENT_EDUCATION_ASSISTANCE,
} from "@/lib/schemes/catalog/education";
import {
  JOB_SEEKER_SUPPORT,
  SKILL_TRAINING_GRANT,
} from "@/lib/schemes/catalog/employment";
import {
  BASIC_HOUSING_ASSISTANCE,
  HOME_REPAIR_GRANT,
} from "@/lib/schemes/catalog/housing";
import {
  SENIOR_CITIZEN_ASSISTANCE,
  SENIOR_WELLBEING_ALLOWANCE,
} from "@/lib/schemes/catalog/senior";
import type { SchemeDefinition } from "@/lib/schemes/types";

/**
 * The complete demonstration catalogue.
 *
 * EVERY SCHEME HERE IS FICTIONAL. None is a real government programme, no
 * threshold is a real entitlement rule, and nothing here was taken from any
 * external source — the names, amounts and criteria were written for this
 * demonstration. `sourceLabel` records that on every row.
 *
 * Twelve schemes across six categories, two per category. The pairs are the
 * point: within each category they differ on a real criterion, so discovery has
 * to discriminate rather than return the only thing it has. Housing is the
 * clearest case — Basic Housing Assistance requires that you do NOT own your
 * home and Home Repair Grant requires that you do, so one answer routes to
 * opposite services and the deterministic checker decides which.
 *
 * Deliberately still small. A larger catalogue would be quicker to generate and
 * far harder to keep accurate, and every scheme here has to be defensible line
 * by line.
 *
 * This array is the SEED SOURCE. The database is what the running system reads,
 * so an approved change to a stored scheme is never silently overwritten by
 * whatever happens to be in the code.
 */
export const DEMO_SCHEMES: readonly SchemeDefinition[] = [
  STUDENT_EDUCATION_ASSISTANCE,
  SCHOOL_STUDENT_SUPPORT,
  JOB_SEEKER_SUPPORT,
  SKILL_TRAINING_GRANT,
  SENIOR_CITIZEN_ASSISTANCE,
  SENIOR_WELLBEING_ALLOWANCE,
  FARMER_INCOME_SUPPORT,
  CROP_PROTECTION_SUPPORT,
  BASIC_HOUSING_ASSISTANCE,
  HOME_REPAIR_GRANT,
  ACCESSIBILITY_SUPPORT,
  CAREGIVER_SUPPORT_ALLOWANCE,
];
