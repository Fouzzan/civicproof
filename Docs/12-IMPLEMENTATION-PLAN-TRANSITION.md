# 12 — Implementation Plan (Transition Build)

This implementation plan is specifically for **transitioning the existing CivicProof codebase into the new Sahayak government-services product**.

It is intentionally different from a greenfield implementation plan.

The repository already contains working technical infrastructure and previously implemented CivicProof features. The goal is therefore:

> **Reuse what is already reliable, remove/de-emphasize what is no longer relevant, and build the new end-to-end Sahayak journey without wasting hackathon time on unnecessary migrations.**

This plan is based on `01-PROBLEM.md` through `11-UI-UX.md`.

---

# 0. Critical Transition Rule

## We are changing the product, not starting from zero.

The existing project already has working foundations such as:

- Next.js + TypeScript.
- Tailwind.
- Existing authentication/session infrastructure.
- Existing Prisma/Neon database infrastructure.
- Existing AI integration/infrastructure.
- Existing Vercel Blob/evidence infrastructure.
- Existing API/backend structure.

Some of these were built for the **old civic incident/evidence workflow** and are no longer part of the Sahayak MVP.

Therefore:

### Reuse

Reuse existing infrastructure when it is already working and does not conflict with the new architecture.

### Adapt

Adapt existing database/API/AI patterns where they can support Sahayak.

### Remove/deprioritize

Do not spend hackathon time preserving old features merely because they already exist.

### Do NOT perform a needless migration

Although `10-TECH-STACK.md` describes SQLite + `better-sqlite3` as the preferred greenfield MVP stack, **do not migrate the existing working Prisma/Neon database to SQLite solely to match that document**.

A migration would add risk without improving the judge-facing product.

For this transition build:

```text
Existing working infrastructure
            ↓
Reuse where useful
            ↓
Build Sahayak on top
            ↓
Remove only obsolete paths when safe
```

The documentation describes the ideal minimal architecture; the implementation should optimize for the actual starting codebase and the hackathon clock.

---

# 1. Target Product After the Transition

The final demo should no longer feel like the old civic incident reporting product.

The primary experience is:

```text
Citizen describes situation
        ↓
Sahayak understands
        ↓
Sahayak identifies supported scheme
        ↓
Sahayak asks only missing questions
        ↓
Controlled eligibility check
        ↓
Eligibility explanation
        ↓
Application preparation
        ↓
Review / edit
        ↓
Explicit confirmation
        ↓
Simulated submission
        ↓
Tracking ID
        ↓
"What's my status?"
        ↓
Simulated status
```

The core UI is one Sahayak chat screen with inline cards.

---

# 2. Transition Inventory — Existing Codebase Audit

## Objective

Before changing implementation, identify exactly what already works and what can be reused.

This is a **short audit task**, not a reason to redesign the repository.

## Files / modules touched

Primarily:

```text
Repository structure
package.json
app/
components/
lib/
prisma/
.env*
```

No major code changes should be made during this task unless required to make the app run.

## Dependencies

None.

## Implementation instructions

Ask the coding AI to inspect the existing project and produce a concise inventory:

### Keep / reuse

Identify:

- Next.js configuration.
- TypeScript setup.
- Tailwind setup.
- Existing UI components worth reusing.
- Existing API conventions.
- Existing database client/repositories.
- Existing authentication/session mechanism.
- Existing AI client infrastructure.
- Existing environment-variable conventions.
- Existing test setup.

### Old product-specific code

Identify code related to:

- Civic incident reporting.
- Case creation.
- Evidence upload.
- Evidence analysis.
- Incident categories.
- Old case status pages.
- Old case-specific APIs.

Classify each as:

```text
KEEP
ADAPT
REMOVE LATER
IGNORE FOR MVP
```

### Important

Do not delete working old code in this task.

## Acceptance criteria

- The coding AI can explain the current architecture.
- Existing database technology is confirmed.
- Existing AI provider/integration is confirmed.
- Existing auth/session mechanism is confirmed.
- Existing reusable UI/API infrastructure is identified.
- Old product-specific areas are identified.
- No unnecessary migration has been started.

## What to test

Only verify that the current application still starts and existing critical functionality has not been accidentally changed.

---

# 3. Task 1 — Convert the Project Foundation to Sahayak

## Objective

Make the existing application ready for the new product while preserving useful infrastructure.

## Files / modules touched

Likely:

```text
app/
components/
lib/
prisma/
package.json
.env.example
```

Exact files depend on the audit.

## Dependencies

- Transition Inventory.

## Implementation instructions

1. Keep the existing Next.js + TypeScript foundation.
2. Keep Tailwind.
3. Keep the existing database layer if it is already working.
4. Keep existing authentication if it is already working, but do not make a complex authentication flow part of the MVP.
5. Remove old product branding from the primary route.
6. Establish Sahayak as the new product identity.
7. Create/adjust server-side modules for:
   - Schemes.
   - Eligibility.
   - Agent.
   - Applications.
   - Status.
8. Keep obsolete civic-reporting code isolated rather than rewriting the whole repository.
9. Ensure server-only secrets remain server-side.

### Database decision

If the existing project already has:

```text
Prisma → Neon/PostgreSQL
```

keep it unless it is actively broken.

Do **not** spend the hackathon migrating:

```text
Prisma/Neon
      ↓
SQLite/better-sqlite3
```

The purpose of the stack decision is to minimize complexity, and in this repository a migration would increase complexity.

## Acceptance criteria

- Existing project still runs.
- Sahayak can become the primary product route.
- Existing useful infrastructure remains available.
- No unnecessary database migration occurs.
- Server/client boundaries remain correct.

## What to test

- Start application.
- Load primary page.
- Run typecheck/lint.
- Verify database connection.
- Verify authentication/session infrastructure if retained.
- Verify no secret is exposed to client code.

---

# 4. Task 2 — Establish One Demonstration Scheme + Rules

## Objective

Create the controlled source of truth for the new government-service workflow.

The MVP should use **one demonstration scheme**, not a broad scheme catalog.

## Files / modules touched

Prefer a dedicated area:

```text
lib/schemes/
lib/eligibility/
```

Existing database schema/repositories may also be touched.

Possible modules:

```text
lib/schemes/types.ts
lib/schemes/repository.ts
lib/eligibility/checker.ts
scripts/seed-scheme.ts
```

## Dependencies

- Task 1.

## Implementation instructions

1. Select one concrete welfare scheme for the demo.
2. Establish its authoritative eligibility criteria before implementation.
3. Keep approximately 3–4 simple criteria.
4. Store the scheme in the existing database layer.
5. Store:
   - Scheme ID.
   - Name.
   - Eligibility rules.
   - Required application fields.
6. Implement a deterministic `EligibilityChecker`.
7. Return:

```text
LIKELY_ELIGIBLE
NOT_ELIGIBLE
MORE_INFORMATION_NEEDED
```

8. Include criterion-level results.
9. Do not allow Claude to invent or modify the rules.

### Important

The exact scheme and exact rule values should not be guessed in application code.

The selected scheme's real criteria must be established first.

## Acceptance criteria

- One scheme is available in the database.
- The scheme has controlled rules.
- Eligibility works without Claude.
- Eligible facts produce the correct positive result.
- Failed facts produce a negative result.
- Missing facts produce a "more information needed" result.
- Criteria explaining the result are available to the agent/UI.

## What to test

At least:

- Fully eligible.
- One failed criterion.
- Multiple failed criteria.
- Missing one fact.
- Missing several facts.
- Invalid fact.
- Unknown scheme.

---

# 5. Task 3 — Replace the Old Primary UI with the Sahayak Chat Shell

## Objective

Turn the existing primary experience into the single polished Sahayak chat interface described in `11-UI-UX.md`.

Do this before connecting the real agent.

## Files / modules touched

Likely:

```text
app/page.tsx
components/chat/
components/cards/
components/ui/
```

Reuse existing components where they are visually suitable.

## Dependencies

- Task 1.
- `11-UI-UX.md`.

## Implementation instructions

Build:

### Header

- Sahayak identity.
- "Your guide to government support" style value proposition.
- Small simulation indicator where appropriate.

### Welcome state

Explain:

> Tell me what you need help with. You don't need to know the scheme name or fill a form first.

Include a few example prompts.

### Conversation

Support:

- User messages.
- Sahayak messages.
- Typing/loading indicator.
- Inline cards.

### Composer

- Text input.
- Send button.
- Loading/disabled state.

### Cards

Build reusable components for:

```text
EligibilityCard
ApplicationCard
ConfirmationCard
SubmissionCard
StatusCard
ErrorCard
```

### Important transition

Do not carry the old evidence-upload/case-report UI into the main Sahayak journey unless a component is genuinely reusable.

## Acceptance criteria

- Primary route opens directly into Sahayak.
- Old civic-reporting UI is no longer the primary experience.
- Chat looks intentional rather than like a temporary developer screen.
- Inline cards render with mock data.
- Simulation disclosure is clear.
- UI works on mobile.
- Existing backend functionality is not broken unnecessarily.

## What to test

- Empty state.
- Send mock message.
- Long messages.
- Loading state.
- Eligibility card.
- Application card.
- Confirmation card.
- Submission card.
- Status card.
- Error card.
- Mobile viewport.

---

# 6. Task 4 — Build the Five Sahayak Tools on the Existing Backend

## Objective

Implement the five controlled tools from `09-AI-DESIGN.md` using the project's existing backend/data layer.

## Files / modules touched

Create a dedicated tool layer:

```text
lib/tools/
lib/schemes/
lib/eligibility/
lib/application/
```

Possible files:

```text
lib/tools/scheme-matcher.ts
lib/tools/eligibility-checker.ts
lib/tools/form-filler.ts
lib/tools/application-submitter.ts
lib/tools/status-tracker.ts
```

## Dependencies

- Task 2.
- Existing database infrastructure.

## Implementation instructions

Implement these tools independently of Claude.

### 1. SchemeMatcher

Input:

```text
user facts
situation summary
```

Output:

```text
supported matches
missing information
reason
```

For the one-scheme MVP, it can remain intentionally simple.

### 2. EligibilityChecker

Use only the controlled scheme rules.

Claude must not be the eligibility authority.

### 3. FormFiller

Convert confirmed user facts into the configured application fields.

It prepares a draft only.

### 4. ApplicationSubmitter

Perform simulated submission only after backend confirmation.

It generates/stores the tracking ID.

### 5. StatusTracker

Read the persisted application status.

It must never invent status.

## Acceptance criteria

- Five tools exist.
- Each tool has typed inputs/outputs.
- Inputs are validated.
- Tools can be unit-tested without Claude.
- Eligibility is deterministic.
- FormFiller produces drafts.
- Submitter requires explicit confirmation.
- StatusTracker reads persisted state.

## What to test

Individually test every tool before integrating Claude.

---

# 7. Task 5 — Connect Claude to Sahayak

## Objective

Replace mock agent behavior with Claude while preserving strict backend control.

## Files / modules touched

Likely:

```text
lib/ai/
lib/agent/
.env*
```

Possible:

```text
lib/ai/claude.ts
lib/agent/prompts.ts
lib/agent/types.ts
```

If the existing project already has a working Claude-compatible AI abstraction, adapt it instead of creating a duplicate provider layer.

## Dependencies

- Task 4.

## Implementation instructions

1. Reuse existing AI client patterns where possible.
2. Configure Claude server-side.
3. Define Sahayak system instructions.
4. Register the five tools.
5. Require structured/validated tool arguments.
6. Instruct Claude:
   - Never invent scheme information.
   - Never invent eligibility rules.
   - Never guess missing facts.
   - Respect corrections.
   - Use EligibilityChecker for eligibility.
   - Never submit without confirmation.
   - Never fabricate status.
   - Keep simulation explicit.
7. Keep prompts concise enough for a hackathon.
8. Handle Claude/API failures gracefully.

## Acceptance criteria

- Claude responds from the server.
- Tool definitions are available.
- Tool arguments are validated.
- Claude cannot directly mutate the database.
- Claude cannot bypass eligibility rules.
- Claude cannot trigger submission without the required confirmation state.

## What to test

- Basic Claude response.
- Tool selection.
- Malformed arguments.
- Missing information.
- Unsupported request.
- Claude failure.
- Eligibility request.
- Status request.

---

# 8. Task 6 — Implement the Agent Loop

## Objective

Implement the actual Sahayak agent:

```text
Understand
   ↓
Decide
   ↓
Call tool
   ↓
Observe result
   ↓
Decide next step
   ↓
Respond
```

## Files / modules touched

Likely:

```text
lib/agent/
app/api/chat/route.ts
```

Possible:

```text
lib/agent/sahayak.ts
lib/agent/loop.ts
lib/agent/state.ts
lib/agent/actions.ts
app/api/chat/route.ts
```

## Dependencies

- Tasks 4 and 5.

## Implementation instructions

Create a bounded state-aware loop.

State should include at minimum:

```text
user/session
intent
user facts
selected scheme
missing facts
eligibility result
draft application
confirmation state
tracking ID
application status
```

On each `/api/chat` request:

1. Load current state.
2. Add the user's message.
3. Ask Claude to interpret the message.
4. If a tool is requested:
   - Validate arguments.
   - Execute tool.
   - Feed the result back to Claude.
5. Continue until a user-facing action/response is ready.
6. Persist state changes.
7. Return a frontend-safe response.

Use a bounded maximum number of iterations.

## Supported actions

```text
ASK_QUESTION
SHOW_ELIGIBILITY
SHOW_APPLICATION
REQUEST_CONFIRMATION
SUBMITTED
SHOW_STATUS
OUT_OF_SCOPE
NOT_ELIGIBLE
```

## Acceptance criteria

- `/api/chat` becomes the main conversational backend.
- Multi-turn state works.
- Known facts are retained.
- Missing facts produce targeted questions.
- Eligibility uses the tool.
- Application preparation uses the tool.
- Submission requires explicit confirmation.
- Status questions route to StatusTracker.
- Agent loop cannot run indefinitely.

## What to test

Conversation:

```text
"I am 62 and need financial support."
        ↓
targeted question
        ↓
user supplies missing information
        ↓
eligibility
        ↓
application
        ↓
confirmation
```

Also test all facts supplied in the first message and facts supplied across several turns.

---

# 9. Task 7 — Application Persistence + Status Persistence

## Objective

Connect the new workflow to the existing database so the application and tracking journey survives across requests.

## Files / modules touched

Prefer existing Prisma/repository infrastructure:

```text
prisma/
lib/repositories/
lib/application/
```

Do not create a second database system.

## Dependencies

- Task 6.

## Implementation instructions

Adapt the existing database rather than replacing it.

Minimum conceptual entities:

```text
USER
SCHEME
APPLICATION
```

The existing authentication/user model may be reused if present.

Application needs enough data for:

```text
scheme
user
status
trackingId
applicationData
submittedAt
```

Support:

```text
draft
submitted
under review
approved
rejected
```

Only implement statuses needed for the demo.

Create a repository/data-access layer so raw database operations do not leak into the agent.

## Acceptance criteria

- User/session identity can be associated with an application.
- Draft application persists.
- Application data persists.
- Tracking ID persists.
- Submitted timestamp persists.
- Status persists.
- Status survives another API request/server process as supported by the existing database.
- Duplicate submission is prevented.
- Submitted applications cannot be silently overwritten.

## What to test

- Create draft.
- Update draft.
- Read draft.
- Confirm.
- Submit.
- Retrieve tracking ID.
- Retrieve status.
- Duplicate submit.
- Modify submitted application.
- Unknown tracking ID.
- Wrong user/session.

---

# 10. Task 8 — Form Preview, Editing, and Confirmation Boundary

## Objective

Connect application generation to the polished UI and make human confirmation mandatory.

## Files / modules touched

Likely:

```text
components/cards/ApplicationCard.*
components/cards/ConfirmationCard.*
lib/application/
lib/agent/
```

## Dependencies

- Tasks 3, 6, and 7.

## Implementation instructions

After successful eligibility:

```text
Eligibility
    ↓
FormFiller
    ↓
Draft application
    ↓
Application preview
```

The preview must show:

- Scheme.
- Collected values.
- Editable values.
- "Not submitted yet."
- Confirmation action.

When the user edits a value:

1. Update the latest confirmed fact.
2. Persist the change.
3. Re-evaluate eligibility if relevant.
4. Update the draft.
5. Do not silently retain the old value.

Before submission show:

```text
Ready to submit?

This will submit the application to the CivicProof
demo system only. It will NOT be sent to a real
government department.

[ Confirm & submit demo application ]
[ Keep editing ]
```

## Acceptance criteria

- Application preview appears after eligibility.
- User can edit values.
- Corrections persist.
- Eligibility is rechecked when required.
- Draft remains unsubmitted until explicit confirmation.
- Confirmation is unmistakable.
- Simulation disclosure appears before submission.

## What to test

- Preview.
- Edit.
- Edit eligibility-related field.
- Confirm unchanged application.
- Confirm edited application.
- Attempt submission without confirmation.
- Reload during review.

---

# 11. Task 9 — Conversational Status Lookup

## Objective

Allow the citizen to ask:

> "What's my status?"

and receive the status inside the same chat.

## Files / modules touched

```text
app/api/application/[id]/route.ts
lib/tools/status-tracker.*
lib/agent/*
components/cards/StatusCard.*
```

## Dependencies

- Tasks 6 and 7.

## Implementation instructions

Support:

```text
What's my status?
```

and:

```text
What's the status of DEMO-123456?
```

For a general request, use the user's current/submitted application context where possible.

For a tracking ID, use the ID directly.

Return:

```text
trackingId
scheme
status
submittedAt
simulation: true
```

Never invent a status.

## Acceptance criteria

- Natural-language status request works.
- Tracking-ID status request works.
- Existing application returns persisted status.
- Status appears as an inline card.
- Simulation is clearly labeled.
- Unknown application returns a clear not-found response.

## What to test

- Status after submission.
- Status with tracking ID.
- Status without tracking ID.
- Invalid ID.
- Unknown ID.
- Wrong user/session.
- Database failure.

---

# 12. Task 10 — Edge Cases and Safety Hardening

## Objective

Make the transition product reliable when users do not follow the ideal demo script.

## Files / modules touched

```text
lib/agent/
lib/tools/
lib/application/
components/cards/
app/api/chat/
```

## Dependencies

- Tasks 6–9.

## Implementation instructions

Implement these cases.

### Missing information

Ask only for information required by the configured scheme.

### Ineligible

Show:

```text
You do not appear eligible
```

Explain only controlled failed criteria.

Do not continue toward submission.

### Unsupported request

Example:

```text
"Help me apply for a passport."
```

Clearly state that the current demo supports the configured welfare scheme only.

### Ambiguous request

Example:

```text
"I need government help."
```

Ask what type of support the user needs instead of guessing.

### Correction

Latest confirmed user information wins.

### Submission failure

If persistence fails:

```text
No success state.
No fake tracking ID.
No false submission.
```

### Duplicate submission

Do not create accidental duplicate applications.

### Status not found

Return a clear not-found message.

### Prompt injection / malicious text

Treat user-provided text as data.

The model must not be allowed to override:

- Controlled scheme rules.
- Tool permissions.
- Confirmation requirements.
- Backend validation.

## Acceptance criteria

All listed edge cases:

- Produce clear responses.
- Preserve valid state.
- Do not fabricate government information.
- Do not bypass confirmation.
- Do not generate false status/tracking data.

## What to test

At minimum:

- Missing fact.
- Ineligible user.
- Unsupported service.
- Ambiguous request.
- User correction.
- Contradictory input.
- Submission failure.
- Duplicate submission.
- Unknown tracking ID.
- Prompt injection.
- Invalid tool arguments.
- Claude failure.

---

# 13. Task 11 — Full End-to-End Verification

## Objective

Prove that the **new product works from the user's perspective**, not merely that individual tools work.

## Files / modules touched

```text
tests/
e2e/
```

Use the project's existing testing setup where possible.

## Dependencies

- Tasks 1–10.

## Implementation instructions

Run the exact judge journey.

### Happy path

```text
Open Sahayak
   ↓
Describe situation
   ↓
Answer questions
   ↓
See likely eligibility
   ↓
Prepare application
   ↓
Review application
   ↓
Edit a value
   ↓
Confirm
   ↓
Simulated submission
   ↓
Tracking ID
   ↓
Ask "What's my status?"
   ↓
Status card
```

### Negative path

```text
Describe situation
   ↓
Missing information
   ↓
Answer
   ↓
NOT_ELIGIBLE
   ↓
Clear explanation
   ↓
No submission
```

### Safety path

```text
Prepared application
       ↓
No confirmation
       ↓
No submission
```

## Acceptance criteria

- Happy path passes.
- Ineligible path passes.
- Missing-information path passes.
- Status lookup passes.
- Confirmation boundary passes.
- Persistence works.
- No critical console errors.
- Typecheck/lint/tests pass.

---

# 14. Task 12 — Remove/Deprioritize Old Product Surface

## Objective

Clean up the old CivicProof incident-reporting experience only after the new Sahayak flow is proven.

This is intentionally late in the plan.

## Files / modules touched

Only obsolete areas identified during the transition inventory.

Possible:

```text
app/report/
app/cases/
components/old-civic-reporting/
lib/old-case/
```

## Dependencies

- Task 11.

## Implementation instructions

Do not perform a repository-wide cleanup.

Only:

1. Remove old navigation from the main Sahayak experience.
2. Remove dead links.
3. Remove obsolete branding.
4. Hide or isolate old routes that would confuse judges.
5. Leave reusable backend infrastructure intact.
6. Delete old code only when it is clearly unused and deletion is low-risk.

### Do not delete working infrastructure just for cleanliness.

A hackathon repository does not need to be architecturally perfect.

## Acceptance criteria

A judge entering the app sees only the new product journey.

There are no obvious old-product links such as:

```text
Report Incident
Upload Evidence
Create Case
Case Tracking
```

unless intentionally retained for another reason.

The Sahayak flow remains unaffected.

## What to test

- Open root route.
- Navigate through every visible link.
- Verify no old product flow is accidentally exposed.
- Verify Sahayak APIs still work.

---

# 15. Task 13 — Demo Polish

## Objective

Make the new Sahayak experience judge-ready without expanding scope.

## Files / modules touched

Primarily:

```text
app/
components/
styles/
lib/agent/prompts.*
```

## Dependencies

- Task 11.
- Task 12 where cleanup is needed.

## Implementation instructions

### First impression

Within approximately five seconds, judges should understand:

> **I can describe my situation, and Sahayak can help figure out what government support may apply and prepare the application for me.**

### Conversation

Make the progression feel natural:

```text
Tell me your situation.
        ↓
I understand.
        ↓
I need one more detail.
        ↓
You appear eligible because...
        ↓
Here's your application.
        ↓
Please review it.
        ↓
Confirm?
        ↓
Your demo application was recorded.
        ↓
Your tracking ID is...
        ↓
Your current simulated status is...
```

### Trust

Make these states obvious:

```text
LIKELY ELIGIBLE
NOT SUBMITTED YET
REVIEW BEFORE SUBMISSION
SIMULATED SUBMISSION
SIMULATED STATUS
```

### Loading

Use:

```text
Sahayak is thinking…
Checking your information…
Preparing your application…
Recording your demo application…
```

Never expose:

```text
Calling Claude
Executing tool
Running SQL
```

### Visual quality

Prioritize:

- Clear typography.
- Strong hierarchy.
- Large touch targets.
- Consistent cards.
- Good spacing.
- Responsive layout.
- Minimal clutter.

Do not redesign the application into a complex dashboard.

## Acceptance criteria

- Product value is immediately understandable.
- Full flow looks cohesive.
- Cards look intentional.
- Simulation is unmistakable.
- Loading/errors are polished.
- Mobile experience is usable.
- No unnecessary secondary features distract from the demo.

## What to test

Run the exact judge demo from a clean browser/session.

---

# 16. Optional Task — My Applications

## Priority

**P2 — only after the complete core journey is excellent.**

## Objective

Provide a lightweight list of submitted demo applications.

## Dependencies

All core tasks must already pass.

## Implementation instructions

Only build this if it can be implemented quickly using existing application persistence.

Show:

```text
My Applications

Demo Welfare Support
DEMO-123456
Under review
Submitted today

[ View in Sahayak ]
```

Do not turn this into a dashboard project.

## Acceptance criteria

- Submitted applications appear.
- Tracking ID is visible.
- Status is visible.
- User can return to Sahayak.

If this begins consuming meaningful hackathon time, stop and remove it from the demo.

---

# 17. Revised Dependency Graph

Because this is a transition from an existing project, the dependency graph is different from a greenfield build:

```text
Existing CivicProof Codebase
            │
            ▼
   Transition Inventory
            │
            ▼
     Project Foundation
            │
       ┌────┴─────┐
       ▼          ▼
   Scheme +     Sahayak
     Rules       UI Shell
       │          │
       └────┬─────┘
            ▼
       Five Tools
            │
            ▼
      Claude Integration
            │
            ▼
       Agent Loop
            │
            ▼
      Persistence
            │
       ┌────┴────┐
       ▼         ▼
 Application    Status
 Review         Lookup
       │         │
       └────┬────┘
            ▼
        Edge Cases
            │
            ▼
      End-to-End Test
            │
            ▼
   Old UI Cleanup / Isolation
            │
            ▼
        Demo Polish
            │
            ▼
      Optional Dashboard
```

---

# 18. Coding-AI Session Plan

Each session should be narrow enough that Claude Code can implement it, test it, and report exactly what changed.

| Session | Task | Result |
|---|---|---|
| 0 | Transition Inventory | Existing code classified |
| 1 | Foundation | Existing app prepared for Sahayak |
| 2 | Scheme + Rules | One seeded scheme + deterministic checker |
| 3 | Chat UI | Sahayak shell + cards |
| 4 | Five Tools | Controlled backend tools |
| 5 | Claude | Claude + tool definitions |
| 6 | Agent Loop | Real multi-turn Sahayak |
| 7 | Persistence | Applications + tracking/status |
| 8 | Application Review | Preview + edit + confirmation |
| 9 | Status | Conversational status |
| 10 | Edge Cases | Safe negative/error paths |
| 11 | E2E | Full journey verified |
| 12 | Cleanup | Old product hidden/isolate |
| 13 | Polish | Judge-ready demo |
| Optional | My Applications | Only if time remains |

---

# 19. Important Hackathon Time Rule

The project should not spend its early hackathon time on architectural migration.

## Bad transition

```text
Existing working project
        ↓
Replace database
        ↓
Replace auth
        ↓
Replace AI provider
        ↓
Rewrite backend
        ↓
Rewrite UI
        ↓
No time left for product
```

## Correct transition

```text
Existing working project
        ↓
Audit
        ↓
Reuse infrastructure
        ↓
Add scheme/rules
        ↓
Build Sahayak UI
        ↓
Add tools
        ↓
Connect Claude
        ↓
Agent loop
        ↓
Complete demo journey
        ↓
Polish
```

The hackathon score comes from the **working product experience**, not from proving that the repository was rebuilt using a particular database library.

---

# 20. Existing Feature Migration Map

The old CivicProof features should be treated deliberately.

| Existing capability | New treatment |
|---|---|
| Next.js | **Keep** |
| TypeScript | **Keep** |
| Tailwind | **Keep** |
| Existing UI primitives | **Reuse where good** |
| Existing authentication | **Keep/reuse if useful** |
| Existing Prisma/Neon | **Keep; do not migrate just for the plan** |
| Existing AI infrastructure | **Reuse/adapt if compatible with Claude** |
| Existing case API | **Do not use as the Sahayak application API unless it fits** |
| Case creation | **Replace conceptually with application creation** |
| Evidence upload | **Out of MVP** |
| Evidence AI analysis | **Out of MVP** |
| Civic incident categories | **Out of MVP** |
| Case timeline | **Not required for MVP** |
| Old report wizard | **Replace with Sahayak conversation** |
| Old case tracking | **Replace with application tracking/status** |
| Vercel Blob | **Not required for the new core flow** |
| Clerk/auth complexity | **Do not make authentication a demo blocker** |

---

# 21. Revised Definition of Done

The transition is successful when the existing repository has become a convincing Sahayak demo.

## Product

- [ ] User starts by describing a situation naturally.
- [ ] User does not need to know the scheme name.
- [ ] One demonstration welfare scheme is supported.
- [ ] Sahayak asks only necessary questions.
- [ ] Eligibility is deterministic.
- [ ] Eligibility explanation is understandable.
- [ ] Application is generated.
- [ ] Application is previewed.
- [ ] User can correct information.
- [ ] Explicit confirmation is required.
- [ ] Submission is simulated.
- [ ] Tracking ID is generated.
- [ ] User can later ask for status.
- [ ] Status is simulated and clearly labeled.
- [ ] Ineligible path works.
- [ ] Missing-information path works.
- [ ] Unsupported requests are handled safely.

## Technical

- [ ] Existing working project foundation is preserved.
- [ ] No unnecessary database migration was performed.
- [ ] Five Sahayak tools exist.
- [ ] Claude uses tool calling.
- [ ] Agent loop is bounded.
- [ ] Backend controls eligibility and critical state.
- [ ] Application data persists.
- [ ] Status persists.
- [ ] Submission requires confirmation.
- [ ] API route is thin and delegates to agent/services.
- [ ] Server secrets remain server-side.

## UX

- [ ] Sahayak chat is the primary screen.
- [ ] Inline cards work.
- [ ] Application review is obvious.
- [ ] Submission simulation is obvious.
- [ ] Status simulation is obvious.
- [ ] Loading states are human-friendly.
- [ ] Errors give the user a next step.
- [ ] Mobile layout works.
- [ ] Old civic-reporting UI does not confuse the demo.
- [ ] The product's value is understandable within seconds.

---

# 22. Final Transition Principle

The implementation should follow this rule throughout the hackathon:

> **Do not rebuild working infrastructure merely because the new plan describes a cleaner greenfield stack. Reuse the existing foundation and spend the saved time making the new Sahayak journey excellent.**

The final technical story should still be clear:

```text
                SAHAYAK
                   │
        Natural-language chat
                   │
                   ▼
            Claude / Agent
                   │
        ┌──────────┼───────────┐
        ▼          ▼           ▼
     Scheme     Eligibility   Form
     Matcher      Checker     Filler
        │          │           │
        └──────────┼───────────┘
                   ▼
          Application Submitter
                   │
                   ▼
            Status Tracker
                   │
                   ▼
          Existing Database
```

The implementation detail underneath may use the repository's already-working Prisma/Neon infrastructure rather than introducing SQLite solely for consistency with a greenfield plan.

**The goal is not a perfect rewrite. The goal is a reliable, polished, genuinely agentic Sahayak demonstration within the hackathon time limit.**
