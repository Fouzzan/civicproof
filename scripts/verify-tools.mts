import { existsSync } from "node:fs";

for (const envFile of [".env", ".env.local"] as const) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const { prisma } = await import("../lib/db/index.ts");
const { executeTool, TOOL_DEFINITIONS, TOOL_NAMES } = await import("../lib/tools/index.ts");
const { confirmDraft, getDraft } = await import("../lib/application/repository.ts");

/**
 * End-to-end verification of the five Sahayak tools against the real database.
 *
 * Runs the whole journey plus every safety boundary that must hold, then
 * removes the rows it created.
 *
 *   npx --yes tsx scripts/verify-tools.ts
 */
const problems: string[] = [];
let checks = 0;

function check(name: string, ok: boolean, detail = "") {
  checks += 1;
  process.stdout.write(`  [${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) problems.push(name);
}

const OWNER = "verify-tools-owner";
const OTHER = "verify-tools-other";

async function makeUser(id: string) {
  return prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, email: `${id}@example.invalid`, name: "Verification User" },
  });
}

async function cleanup() {
  await prisma.application.deleteMany({ where: { userId: { in: [OWNER, OTHER] } } });
  await prisma.conversation.deleteMany({ where: { userId: { in: [OWNER, OTHER] } } });
  await prisma.user.deleteMany({ where: { id: { in: [OWNER, OTHER] } } });
}

const ctx = { userId: OWNER };
const call = (name: string, args: unknown) =>
  executeTool(name, JSON.stringify(args), ctx);

try {
  await cleanup();
  await makeUser(OWNER);
  await makeUser(OTHER);

  // --- Tool schemas -------------------------------------------------------
  check("five tools registered", TOOL_NAMES.length === 5, TOOL_NAMES.join(", "));
  check(
    "every tool exposes a JSON-Schema object with no $schema banner",
    TOOL_DEFINITIONS.every((d) => {
      const fn = (d as { function: { parameters: Record<string, unknown> } }).function;
      return fn.parameters.type === "object" && !("$schema" in fn.parameters);
    }),
  );
  // The description SHOULD mention confirmation — that instruction is useful.
  // What must not exist is a *parameter* the model could set to assert it.
  const submitParams = (
    TOOL_DEFINITIONS.find(
      (d) => (d as { function: { name: string } }).function.name === "submit_application",
    ) as { function: { parameters: { properties?: Record<string, unknown> } } }
  ).function.parameters;
  const submitArgNames = Object.keys(submitParams.properties ?? {});
  check(
    "submit_application accepts only applicationId — no argument can assert confirmation",
    submitArgNames.length === 1 && submitArgNames[0] === "applicationId",
    submitArgNames.join(", "),
  );

  // --- SchemeMatcher ------------------------------------------------------
  const matched = await call("match_schemes", { situationSummary: "I am a student with low family income." });
  const catalogue = matched.ok
    ? (matched.data as { supportedSchemes: { slug: string; category: string }[] }).supportedSchemes
    : [];
  check("match_schemes returns the whole catalogue", catalogue.length === 6, `${catalogue.length} schemes`);
  check(
    "every category is discoverable",
    new Set(catalogue.map((s) => s.category)).size === 6,
  );

  // --- EligibilityChecker: partial ---------------------------------------
  const partial = await call("check_eligibility", {
    schemeSlug: "student-education-assistance",
    facts: { age: 22 },
  });
  const partialResult = partial.ok
    ? (partial.data as { result: { outcome: string }; missing: unknown[] })
    : null;
  check(
    "partial facts -> MORE_INFORMATION_NEEDED with questions to ask",
    partialResult?.result.outcome === "MORE_INFORMATION_NEEDED" && partialResult.missing.length === 2,
  );

  // --- Fact normalisation -------------------------------------------------
  const messy = await call("check_eligibility", {
    schemeSlug: "student-education-assistance",
    facts: { annualHouseholdIncome: "₹90,000", isStudent: "yes" },
  });
  check(
    'messy input ("₹90,000", "yes") normalises and completes the check',
    messy.ok && (messy.data as { result: { outcome: string } }).result.outcome === "LIKELY_ELIGIBLE",
  );

  const junk = await call("check_eligibility", {
    schemeSlug: "student-education-assistance",
    facts: { age: "not a number" },
  });
  check(
    "unparseable fact is rejected, not guessed",
    junk.ok && (junk.data as { rejected: unknown[] }).rejected.length === 1,
  );

  // --- Unknown scheme -----------------------------------------------------
  const bogusScheme = await call("check_eligibility", {
    schemeSlug: "passport-renewal",
    facts: {},
  });
  check("unknown scheme is refused", !bogusScheme.ok && bogusScheme.code === "SCHEME_NOT_FOUND");

  // --- FormFiller ---------------------------------------------------------
  const formA = await call("prepare_application", { schemeSlug: "student-education-assistance" });
  check(
    "prepare_application asks for name + district and is not ready",
    formA.ok &&
      (formA.data as { missing: unknown[]; readyToConfirm: boolean }).missing.length === 2 &&
      !(formA.data as { readyToConfirm: boolean }).readyToConfirm,
  );

  const formB = await call("prepare_application", {
    schemeSlug: "student-education-assistance",
    facts: { fullName: "A. Kumar", district: "Malappuram" },
  });
  const ready = formB.ok
    ? (formB.data as { applicationId: string; readyToConfirm: boolean; notSubmitted: boolean })
    : null;
  check("complete application is readyToConfirm", ready?.readyToConfirm === true);
  check("draft always reports notSubmitted", ready?.notSubmitted === true);

  const applicationId = ready?.applicationId ?? "";

  // --- THE safety boundary ------------------------------------------------
  const premature = await call("submit_application", { applicationId });
  check(
    "submit WITHOUT confirmation is refused",
    !premature.ok && premature.code === "CONFIRMATION_REQUIRED",
  );

  const stillDraft = await getDraft(OWNER);
  check(
    "refused submission left no tracking id",
    stillDraft?.trackingId === null && stillDraft?.status === "DRAFT",
  );

  // --- Confirm, then submit ----------------------------------------------
  await confirmDraft(OWNER, applicationId);
  const submitted = await call("submit_application", { applicationId });
  const receipt = submitted.ok
    ? (submitted.data as { trackingId: string; simulated: boolean; status: string })
    : null;
  check("submit AFTER confirmation succeeds", submitted.ok);
  check(
    "tracking id has the DEMO- prefix",
    /^DEMO-\d{6}$/.test(receipt?.trackingId ?? ""),
    receipt?.trackingId,
  );
  check("result is flagged simulated", receipt?.simulated === true);

  // --- Duplicate submission ----------------------------------------------
  const duplicate = await call("submit_application", { applicationId });
  check(
    "duplicate submission is refused",
    !duplicate.ok && duplicate.code === "ALREADY_SUBMITTED",
  );
  const count = await prisma.application.count({ where: { userId: OWNER } });
  check("exactly one application row exists", count === 1, `count=${count}`);

  // --- StatusTracker ------------------------------------------------------
  const statusA = await call("get_application_status", {});
  check(
    "status without a reference finds the latest application",
    statusA.ok &&
      (statusA.data as { trackingId: string }).trackingId === receipt?.trackingId,
  );

  const statusB = await call("get_application_status", { trackingId: receipt?.trackingId });
  check("status by tracking id works", statusB.ok);

  const statusBad = await call("get_application_status", { trackingId: "DEMO-000000" });
  check("unknown tracking id -> NOT_FOUND, never invented", !statusBad.ok && statusBad.code === "NOT_FOUND");

  const statusMalformed = await call("get_application_status", { trackingId: "banana" });
  check("malformed tracking id -> INVALID_INPUT", !statusMalformed.ok && statusMalformed.code === "INVALID_INPUT");

  // --- Cross-user isolation ----------------------------------------------
  const crossUser = await executeTool(
    "get_application_status",
    JSON.stringify({ trackingId: receipt?.trackingId }),
    { userId: OTHER },
  );
  check(
    "another citizen cannot read this tracking id",
    !crossUser.ok && crossUser.code === "NOT_FOUND",
  );

  // --- Ineligible path ----------------------------------------------------
  await prisma.application.deleteMany({ where: { userId: OTHER } });
  const otherCtx = { userId: OTHER };
  const ineligible = await executeTool(
    "check_eligibility",
    JSON.stringify({
      schemeSlug: "student-education-assistance",
      facts: { isStudent: true, age: 22, annualHouseholdIncome: 900_000 },
    }),
    otherCtx,
  );
  check(
    "over-income citizen -> NOT_ELIGIBLE",
    ineligible.ok &&
      (ineligible.data as { result: { outcome: string } }).result.outcome === "NOT_ELIGIBLE",
  );

  const blockedForm = await executeTool(
    "prepare_application",
    JSON.stringify({ schemeSlug: "student-education-assistance" }),
    otherCtx,
  );
  check(
    "ineligible citizen cannot have an application prepared",
    !blockedForm.ok && blockedForm.code === "NOT_ELIGIBLE",
  );

  // --- Multi-scheme draft scoping ----------------------------------------
  // OTHER already has a student draft from the ineligible check above. Adding a
  // housing draft means "their most recent draft" and "their housing draft" are
  // different rows — which is exactly the confusion a six-scheme catalogue
  // introduces and what the schemeSlug filter on getDraft exists to prevent.
  await executeTool(
    "check_eligibility",
    JSON.stringify({
      schemeSlug: "basic-housing-assistance",
      facts: { ownsHome: false, householdSize: 4, annualHouseholdIncome: 120_000 },
    }),
    otherCtx,
  );

  const studentDraft = await getDraft(OTHER, "student-education-assistance");
  const housingDraft = await getDraft(OTHER, "basic-housing-assistance");

  check(
    "a citizen can hold drafts in two schemes at once",
    studentDraft !== null && housingDraft !== null && studentDraft.id !== housingDraft.id,
  );
  check(
    "getDraft scoped by scheme returns the matching draft",
    studentDraft?.schemeSlug === "student-education-assistance" &&
      housingDraft?.schemeSlug === "basic-housing-assistance",
  );

  const housingForm = await executeTool(
    "prepare_application",
    JSON.stringify({
      schemeSlug: "basic-housing-assistance",
      facts: { fullName: "B. Nair", district: "Kozhikode" },
    }),
    otherCtx,
  );
  check(
    "prepare_application works on the housing draft, not the student one",
    housingForm.ok &&
      (housingForm.data as { schemeSlug: string }).schemeSlug === "basic-housing-assistance",
  );

  // --- Malformed model output --------------------------------------------
  const badJson = await executeTool("check_eligibility", "{not json", ctx);
  check("malformed tool arguments -> INVALID_INPUT", !badJson.ok && badJson.code === "INVALID_INPUT");

  const unknownTool = await executeTool("drop_database", "{}", ctx);
  check("unknown tool name is refused", !unknownTool.ok && unknownTool.code === "INVALID_INPUT");

  const wrongShape = await executeTool("check_eligibility", JSON.stringify({ facts: {} }), ctx);
  check("missing required argument -> INVALID_INPUT", !wrongShape.ok && wrongShape.code === "INVALID_INPUT");
} catch (error) {
  problems.push(`threw: ${error instanceof Error ? error.message : "unknown"}`);
  process.stdout.write(`\n  THREW: ${error instanceof Error ? error.stack : error}\n`);
} finally {
  await cleanup();
  await prisma.$disconnect();
}

process.stdout.write(
  problems.length === 0
    ? `\nAll ${checks} tool checks passed.\n`
    : `\n${problems.length} of ${checks} failed:\n${problems.map((p) => `  - ${p}`).join("\n")}\n`,
);
process.exit(problems.length === 0 ? 0 : 1);
