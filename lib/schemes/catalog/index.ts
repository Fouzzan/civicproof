import { ACCESSIBILITY_SUPPORT } from "@/lib/schemes/catalog/accessibility";
import { FARMER_INCOME_SUPPORT } from "@/lib/schemes/catalog/agriculture";
import { STUDENT_EDUCATION_ASSISTANCE } from "@/lib/schemes/catalog/education";
import { JOB_SEEKER_SUPPORT } from "@/lib/schemes/catalog/employment";
import { BASIC_HOUSING_ASSISTANCE } from "@/lib/schemes/catalog/housing";
import { SENIOR_CITIZEN_ASSISTANCE } from "@/lib/schemes/catalog/senior";
import type { SchemeDefinition } from "@/lib/schemes/types";

/**
 * The complete demonstration catalogue.
 *
 * EVERY SCHEME HERE IS FICTIONAL. None is a real government programme and no
 * threshold is a real entitlement rule.
 *
 * Six schemes across six categories is a deliberate size: enough to prove the
 * engine is category-agnostic and to give discovery something to choose
 * between, small enough that each one can be written carefully and checked.
 *
 * This array is the SEED SOURCE. The database is what the running system reads,
 * so an approved change to a stored scheme is never silently overwritten by
 * whatever happens to be in the code.
 */
export const DEMO_SCHEMES: readonly SchemeDefinition[] = [
  STUDENT_EDUCATION_ASSISTANCE,
  JOB_SEEKER_SUPPORT,
  SENIOR_CITIZEN_ASSISTANCE,
  FARMER_INCOME_SUPPORT,
  BASIC_HOUSING_ASSISTANCE,
  ACCESSIBILITY_SUPPORT,
];
