# CivicProof --- Implementation Plan

## Purpose

This document converts the decisions in `docs/01-PROBLEM.md` through
`docs/11-UI-UX.md` into a **small, sequential implementation plan** for
the hackathon.

The target is a roughly **4-hour build** by a beginner/team using a
coding AI.

The plan deliberately favors:

-   one focused task at a time
-   one modular Next.js application
-   minimal infrastructure
-   working end-to-end flow before polish
-   server-side authorization
-   bounded AI assistance
-   truthful case states
-   no unnecessary architecture

Each task should be small enough for a coding AI to implement in **one
focused session** without redesigning unrelated parts of the
application.

------------------------------------------------------------------------

# 0. Build Strategy

The implementation order is:

``` text
Project Setup
      ↓
Database
      ↓
Authentication
      ↓
Core UI Shell
      ↓
Incident Input
      ↓
Case Creation
      ↓
Evidence
      ↓
AI Analysis
      ↓
Complaint Generation
      ↓
Handoff + Tracking
      ↓
Authority Workflow
      ↓
Resolution
      ↓
Error Handling
      ↓
Testing
      ↓
Demo Polish
      ↓
Deployment
```

## Critical rule

At every stage, keep the application runnable.

Do not spend the first half of the hackathon building infrastructure
that users cannot see.

The first major milestone should be:

``` text
Citizen can create a case
        ↓
Case is saved
        ↓
Case can be viewed
```

The second major milestone:

``` text
Case
 ↓
AI analysis
 ↓
Complaint
```

The final milestone:

``` text
Citizen
 ↓
Case
 ↓
Authority
 ↓
Resolution
 ↓
Citizen sees resolution
```

------------------------------------------------------------------------

# Phase 1 --- Project Setup

## Task 1 --- Initialize the Next.js application

### Objective

Create the base CivicProof application using the selected technology
stack.

### Files/modules touched

-   `package.json`
-   `app/`
-   `public/`
-   `tsconfig.json`
-   `next.config.*`
-   Tailwind configuration
-   shadcn/ui configuration
-   `.env.example`
-   `.gitignore`

### Dependencies

None.

### Implementation instructions

1.  Create a Next.js App Router project.
2.  Use TypeScript.
3.  Add Tailwind CSS.
4.  Add shadcn/ui.
5.  Create a minimal global layout.
6.  Add a basic CivicProof brand/header.
7.  Add an `.env.example` containing names only for required environment
    variables.
8.  Do not add database/auth/AI code yet.

### Acceptance criteria

-   Application starts locally.
-   TypeScript compiles.
-   Tailwind works.
-   shadcn/ui can render a test component.
-   Home route loads.
-   No secrets are committed.

### What to test

-   `npm run dev`
-   Open `/`
-   Verify styling.
-   Verify production build can start with `npm run build`.

------------------------------------------------------------------------

## Task 2 --- Establish the application folder structure

### Objective

Create only the module boundaries needed by the architecture.

### Files/modules touched

-   `app/`
-   `components/`
-   `lib/`
-   `types/`
-   `prisma/`

### Dependencies

Task 1.

### Implementation instructions

Create a simple structure such as:

``` text
app/
  citizen/
  authority/
  cases/
  report/
  api/

components/
  ui/
  cases/
  evidence/
  forms/

lib/
  db/
  auth/
  ai/
  storage/

types/
```

Do not create empty feature modules that are not yet needed.

### Acceptance criteria

-   Folder structure exists.
-   No duplicate business logic is created.
-   Application still runs.

### What to test

-   Start development server.
-   Confirm existing routes still work.
-   Run TypeScript check.

------------------------------------------------------------------------

# Phase 2 --- Database

## Task 3 --- Configure Neon PostgreSQL and Prisma

### Objective

Connect the application to the persistent relational database required
by the architecture.

### Files/modules touched

-   `prisma/schema.prisma`
-   `lib/db/*`
-   `.env`
-   `.env.example`
-   `package.json`

### Dependencies

Task 1.

### Implementation instructions

1.  Create the Neon PostgreSQL database.
2.  Add the database connection string to environment variables.
3.  Install Prisma and the PostgreSQL adapter/configuration appropriate
    to the selected Prisma version.
4.  Create a reusable Prisma client.
5.  Keep database access server-side.

### Acceptance criteria

-   Prisma can connect to Neon.
-   Prisma client can be imported from one shared module.
-   Database credentials are not exposed to client code.

### What to test

-   Run Prisma validation.
-   Run a database connection test.
-   Run the application.

------------------------------------------------------------------------

## Task 4 --- Implement the five-table Prisma schema

### Objective

Implement the database model already defined in `docs/07-DATABASE.md`.

### Files/modules touched

-   `prisma/schema.prisma`

### Dependencies

Task 3.

### Implementation instructions

Implement:

``` text
User
Case
Evidence
AIAnalysis
TimelineEvent
```

Use the relationships already specified.

Important fields include:

### User

-   id
-   name
-   email
-   role
-   timestamps

### Case

-   id
-   caseId
-   reporterId
-   incidentType
-   description
-   incidentDateTime
-   location
-   isSensitive
-   status
-   severity
-   severityReason
-   reportingDirection
-   reportingChannel
-   complaintDraft
-   handoffStatus
-   authorityUserId
-   resolutionText
-   resolvedAt
-   timestamps

### Evidence

-   id
-   caseId
-   fileName
-   fileType
-   storageReference
-   description
-   uploadedBy
-   createdAt

### AIAnalysis

-   id
-   caseId
-   summary
-   structuredData
-   severitySuggestion
-   reportingSuggestion
-   modelLabel
-   createdAt

### TimelineEvent

-   id
-   caseId
-   actorUserId
-   eventType
-   title
-   description
-   createdAt

Use enums for stable values such as:

``` text
CITIZEN / AUTHORITY
LOW / MEDIUM / HIGH / URGENT
case statuses
handoff statuses
event types
```

Keep the enum set small.

### Acceptance criteria

-   Schema validates.
-   Migration applies successfully.
-   All five entities exist.
-   Relationships work.
-   Case ID is unique.
-   AI analysis is one-to-zero-or-one per case for the MVP.

### What to test

-   Prisma validation.
-   Migration.
-   Generate Prisma client.
-   Inspect database tables.

------------------------------------------------------------------------

## Task 5 --- Add database seed/demo users

### Objective

Create safe synthetic users for the citizen and authority demo.

### Files/modules touched

-   `prisma/seed.*`
-   `package.json`

### Dependencies

Task 4.

### Implementation instructions

Create synthetic accounts/records for:

``` text
Citizen Demo
Authority Demo
```

Do not use real personal information.

Use the seed only for development/demo convenience.

### Acceptance criteria

-   Seed runs successfully.
-   Citizen and authority users exist.
-   Roles are correct.

### What to test

-   Reset/test database if appropriate.
-   Run seed.
-   Verify both users.

------------------------------------------------------------------------

# Phase 3 --- Authentication

## Task 6 --- Configure Clerk authentication

### Objective

Add secure authentication without building authentication from scratch.

### Files/modules touched

-   `lib/auth/*`
-   `app/*` authentication-related routes/components
-   Clerk configuration
-   `.env.example`
-   package dependencies

### Dependencies

Tasks 1--5.

### Implementation instructions

1.  Configure Clerk.
2.  Add sign-in/sign-up flow.
3.  Create a server-side helper for retrieving the current user.
4.  Map the authenticated user to the application's `User` record.
5.  Keep role information in the application/database rather than
    trusting a client-provided role.

### Acceptance criteria

-   Unauthenticated users can sign in.
-   Backend can identify the current user.
-   Citizen and authority identities can be distinguished.
-   Client cannot simply declare itself an authority.

### What to test

-   Sign in as citizen.
-   Sign in as authority.
-   Confirm current-user identity server-side.
-   Attempt access without authentication.

------------------------------------------------------------------------

## Task 7 --- Implement role and case authorization helpers

### Objective

Create reusable authorization checks before building protected APIs.

### Files/modules touched

-   `lib/auth/authorization.*`
-   `lib/cases/access.*`

### Dependencies

Task 6.

### Implementation instructions

Create small server-side helpers for:

``` text
requireAuthenticatedUser()
requireCitizen()
requireAuthority()
canViewCase()
canEditCase()
canUpdateAuthorityState()
```

Rules:

``` text
Citizen:
case.reporterId === currentUser.id

Authority:
case.authorityUserId === currentUser.id
```

Sensitive cases must never bypass authorization.

### Acceptance criteria

-   Authorization logic exists in one reusable location.
-   Client input cannot override role/access.
-   Sensitive case access is protected.

### What to test

-   Citizen accessing own case.
-   Citizen accessing another user's case.
-   Authority accessing assigned case.
-   Authority accessing unrelated case.
-   Unauthenticated access.

------------------------------------------------------------------------

# Phase 4 --- Core UI

## Task 8 --- Build the landing/report-start screen

### Objective

Make CivicProof's core value obvious within seconds.

### Files/modules touched

-   `app/page.tsx`
-   shared header/branding components
-   relevant UI components

### Dependencies

Tasks 1 and 6.

### Implementation instructions

Build:

``` text
CivicProof

Turn a real-world problem into
an actionable, trackable case.

Report what happened.
Add evidence.
Get AI-assisted guidance.
Track it to resolution.

[ Report an Incident ]
```

Include a small workflow visual:

``` text
Incident → Evidence → AI → Case → Resolution
```

Include a concise privacy reassurance.

Avoid dashboards/statistics/features that do not support the MVP.

### Acceptance criteria

-   Core value is visible above the fold.
-   One primary CTA is obvious.
-   Mobile layout works.
-   No unnecessary feature screens are introduced.

### What to test

-   Desktop.
-   Mobile-width browser.
-   CTA navigation.

------------------------------------------------------------------------

## Task 9 --- Build the citizen report form shell

### Objective

Create the UI for entering an incident without connecting it to the
database yet.

### Files/modules touched

-   `app/report/*`
-   `components/forms/*`
-   relevant UI components

### Dependencies

Task 8.

### Implementation instructions

Include:

-   incident type
-   description
-   date/time
-   location
-   evidence upload area
-   sensitive/private indicator
-   immediate safety guidance for relevant categories
-   continue button

Use React Hook Form + Zod if included in the selected implementation.

Keep required fields minimal.

### Acceptance criteria

-   Form is usable on mobile.
-   Sensitive categories visibly become private.
-   Safety guidance appears where relevant.
-   Client-side validation works.
-   No API calls are required yet.

### What to test

-   Select each incident category.
-   Submit empty form.
-   Enter valid data.
-   Toggle sensitive categories.
-   Check mobile layout.

------------------------------------------------------------------------

# Phase 5 --- User Input and Case Creation

## Task 10 --- Add incident validation schema

### Objective

Create one shared validation definition for case creation.

### Files/modules touched

-   `lib/validation/case.*`
-   `types/*`

### Dependencies

Task 9.

### Implementation instructions

Validate:

-   incident type
-   description
-   optional date/time
-   optional location
-   sensitive flag

Do not require irrelevant information.

Ensure sensitive incident types cannot accidentally become public.

### Acceptance criteria

-   Valid input passes.
-   Missing description fails.
-   Invalid enum values fail.
-   Optional fields remain optional.
-   Sensitive types are protected.

### What to test

Test valid and invalid cases directly.

------------------------------------------------------------------------

## Task 11 --- Implement `POST /api/cases`

### Objective

Create a persistent case from the citizen's report.

### Files/modules touched

-   `app/api/cases/route.ts`
-   case service/module
-   timeline service/module

### Dependencies

Tasks 4, 7, and 10.

### Implementation instructions

The endpoint must:

1.  Require authenticated citizen.
2.  Validate request.
3.  Get reporter identity from the server.
4.  Generate internal ID.
5.  Generate human-readable case ID.
6.  Create the `Case`.
7.  Create `CASE_CREATED` timeline event.
8.  Return the created case.
9.  Never call AI automatically.
10. Never claim official submission.

### Acceptance criteria

-   Case is persisted.
-   Case ID is unique.
-   Reporter ID comes from authentication.
-   Timeline event is created.
-   Unauthorized users are rejected.

### What to test

-   Valid creation.
-   Invalid request.
-   Unauthenticated request.
-   Case ID uniqueness.
-   Sensitive case creation.

------------------------------------------------------------------------

## Task 12 --- Connect the report form to case creation

### Objective

Make the first real citizen journey work end-to-end.

### Files/modules touched

-   `app/report/*`
-   report form components
-   API client/helper if used

### Dependencies

Task 11.

### Implementation instructions

On submit:

``` text
Form
 ↓
POST /api/cases
 ↓
Case created
 ↓
Navigate to case/analysis state
```

Preserve entered information if the request fails.

### Acceptance criteria

A citizen can:

``` text
Open app
→ Report Incident
→ Fill form
→ Submit
→ Receive case ID
```

### What to test

-   Happy path.
-   API failure.
-   Duplicate click.
-   Validation failure.
-   Mobile submission.

------------------------------------------------------------------------

# Phase 6 --- Evidence

## Task 13 --- Configure evidence storage

### Objective

Provide simple object storage for evidence files.

### Files/modules touched

-   `lib/storage/*`
-   environment configuration
-   storage configuration

### Dependencies

Tasks 3 and 12.

### Implementation instructions

Configure Vercel Blob or the selected object-storage mechanism.

Keep MVP evidence scope narrow:

-   images first
-   reasonable file-size limit

Store only metadata/reference in PostgreSQL.

### Acceptance criteria

-   A test image can be uploaded.
-   Storage reference can be generated.
-   Database does not store file bytes in the Case row.

### What to test

-   Valid image.
-   Oversized file.
-   Unsupported file type.
-   Storage failure.

------------------------------------------------------------------------

## Task 14 --- Implement `POST /api/cases/:caseId/evidence`

### Objective

Associate an uploaded evidence file with an authorized case.

### Files/modules touched

-   `app/api/cases/[caseId]/evidence/route.ts`
-   evidence service/module

### Dependencies

Tasks 7 and 13.

### Implementation instructions

1.  Authenticate.
2.  Load case.
3.  Verify case access.
4.  Validate file.
5.  Upload file.
6.  Create Evidence record.
7.  Return evidence metadata.
8.  Never mark evidence authentic or legally admissible.

### Acceptance criteria

-   Authorized citizen can upload evidence.
-   Unauthorized user cannot.
-   Evidence inherits sensitive-case permissions.
-   Evidence metadata references the stored file.

### What to test

-   Valid upload.
-   Unauthorized case.
-   Unsupported file.
-   Oversized file.
-   Sensitive case.

------------------------------------------------------------------------

## Task 15 --- Connect evidence upload to the report/case UI

### Objective

Allow citizens to attach evidence without leaving the reporting
workflow.

### Files/modules touched

-   evidence uploader component
-   report/case page

### Dependencies

Task 14.

### Implementation instructions

Show:

``` text
Add evidence (optional)
[ Upload Photo / File ]
```

Display:

-   file name
-   type
-   upload status
-   remove option where supported

Do not block case creation if evidence upload fails.

### Acceptance criteria

-   Image can be selected.
-   Image uploads to the case.
-   Uploaded evidence appears in the case.
-   Upload failure does not destroy the case.

### What to test

-   One image.
-   Multiple images if supported.
-   Upload failure.
-   Sensitive evidence.
-   Mobile file picker.

------------------------------------------------------------------------

# Phase 7 --- Main Processing

## Task 16 --- Implement case retrieval endpoint

### Objective

Provide one permission-aware endpoint for displaying a complete case.

### Files/modules touched

-   `app/api/cases/[caseId]/route.ts`
-   case service/module

### Dependencies

Tasks 7, 11, 14.

### Implementation instructions

Return the authorized case with:

-   case details
-   evidence metadata
-   AI analysis if present
-   timeline
-   complaint
-   status
-   handoff state
-   resolution

Never return protected data to unauthorized users.

### Acceptance criteria

-   Citizen can retrieve own case.
-   Authorized authority can retrieve assigned case.
-   Unauthorized users cannot retrieve protected cases.
-   Sensitive case data is private.

### What to test

-   Own case.
-   Other citizen's case.
-   Assigned authority.
-   Unassigned authority.
-   Sensitive case.
-   Missing case.

------------------------------------------------------------------------

## Task 17 --- Build the reusable case tracking view

### Objective

Create the main case view used by citizens.

### Files/modules touched

-   `app/cases/[caseId]/*`
-   `components/cases/*`

### Dependencies

Task 16.

### Implementation instructions

Build sections for:

-   case ID
-   status
-   incident summary/details
-   evidence
-   AI analysis placeholder
-   complaint placeholder
-   handoff state
-   timeline
-   resolution placeholder

Use a vertical timeline on mobile.

### Acceptance criteria

-   Case ID is prominent.
-   Current status is obvious.
-   Timeline is readable.
-   Evidence is permission-controlled.
-   Missing sections have useful empty states.

### What to test

-   New case.
-   Case with evidence.
-   Case without evidence.
-   Mobile timeline.
-   Unauthorized access.

------------------------------------------------------------------------

# Phase 8 --- AI Integration

## Task 18 --- Create the server-side AI client

### Objective

Create one isolated AI integration module.

### Files/modules touched

-   `lib/ai/client.*`
-   `lib/ai/types.*`
-   environment configuration

### Dependencies

Task 3.

### Implementation instructions

1.  Add OpenAI API key to server-side environment.
2.  Install the official SDK.
3.  Create a reusable server-only client.
4.  Never expose the key to the browser.
5.  Keep provider-specific code inside `lib/ai`.

Do not implement application logic in the AI client itself.

### Acceptance criteria

-   Server can call the provider.
-   API key is server-only.
-   Client components cannot import the AI client.

### What to test

-   Successful API call with synthetic data.
-   Missing API key.
-   Provider error.

------------------------------------------------------------------------

## Task 19 --- Define the AI case-analysis schema and prompt

### Objective

Create the bounded AI Assistant operation for case analysis.

### Files/modules touched

-   `lib/ai/case-analysis.*`
-   AI schemas/types

### Dependencies

Task 18.

### Implementation instructions

Request structured output containing:

``` text
summary
structuredData
severitySuggestion
severityReason
reportingSuggestion
reportingChannel
```

Allowed severity:

``` text
LOW
MEDIUM
HIGH
URGENT
```

Prompt rules:

-   use only supplied information
-   preserve uncertainty
-   do not invent facts
-   do not determine guilt/liability
-   do not invent authorities
-   treat reporting direction as guidance
-   do not invent laws
-   clearly distinguish AI interpretation from user facts

### Acceptance criteria

-   Output has predictable structure.
-   Invalid output can be rejected.
-   AI output is clearly marked as AI-assisted.
-   User facts remain unchanged.

### What to test

Use synthetic cases for:

-   pothole
-   garbage/waste issue
-   service failure
-   harassment
-   insufficient information

Verify no fabricated facts are introduced.

------------------------------------------------------------------------

## Task 20 --- Implement `POST /api/cases/:caseId/ai-analysis`

### Objective

Expose case analysis through the internal backend API.

### Files/modules touched

-   `app/api/cases/[caseId]/ai-analysis/route.ts`
-   AI case-analysis service
-   case/timeline service

### Dependencies

Tasks 7, 16, and 19.

### Implementation instructions

1.  Authenticate.
2.  Authorize case access.
3.  Load necessary case data.
4.  Send only necessary data to AI.
5.  Validate structured response.
6.  Store `AIAnalysis`.
7.  Update relevant Case fields.
8.  Create `AI_ANALYSIS_COMPLETED`.
9.  On failure, do not create fake analysis.

### Acceptance criteria

Successful request produces:

``` text
AIAnalysis
+
Case severity/reporting fields
+
Timeline event
```

Failed AI request leaves the case usable.

### What to test

-   Successful analysis.
-   AI timeout.
-   Invalid response.
-   Unauthorized case.
-   Insufficient information.
-   Sensitive case data minimization.

------------------------------------------------------------------------

## Task 21 --- Connect AI analysis to the case UI

### Objective

Make the AI value visible and understandable.

### Files/modules touched

-   `components/cases/AIAnalysisCard.*`
-   case page

### Dependencies

Task 20.

### Implementation instructions

Display:

``` text
AI-Assisted Case Summary

Suggested Severity
MEDIUM

Why:
...

Suggested Reporting Direction
...
```

Separate:

``` text
YOUR REPORT
```

from:

``` text
AI-ASSISTED ANALYSIS
```

Add a clear disclaimer that severity is an assessment, not an official
determination.

### Acceptance criteria

-   AI analysis is visually distinct.
-   User can tell what came from them versus AI.
-   AI failure is clearly shown.
-   No AI result is shown when none exists.

### What to test

-   Successful analysis.
-   No analysis.
-   AI failure.
-   Mobile layout.

------------------------------------------------------------------------

# Phase 9 --- Complaint Generation

## Task 22 --- Create complaint-generation AI operation

### Objective

Generate a reviewable complaint using only trusted case information.

### Files/modules touched

-   `lib/ai/complaint-generation.*`

### Dependencies

Tasks 19 and 21.

### Implementation instructions

Input:

``` text
Original case information
+
AI analysis where useful
+
Configured reporting context
```

Output:

``` text
draft
reviewRequired: true
aiAssisted: true
```

Rules:

-   no invented facts
-   no invented evidence
-   no definitive legal conclusions
-   no submission claim
-   draft must remain editable

### Acceptance criteria

-   Draft is non-empty.
-   Draft reflects supplied facts.
-   Draft is explicitly reviewable.
-   No official-submission language is invented.

### What to test

-   Civic case.
-   Sensitive case.
-   Missing information.
-   AI failure.

------------------------------------------------------------------------

## Task 23 --- Implement `POST /api/cases/:caseId/complaint`

### Objective

Persist a generated complaint draft.

### Files/modules touched

-   `app/api/cases/[caseId]/complaint/route.ts`
-   complaint AI service
-   timeline service

### Dependencies

Tasks 7, 16, and 22.

### Implementation instructions

1.  Authenticate.
2.  Authorize case.
3.  Load authoritative case facts server-side.
4.  Generate complaint.
5.  Validate response.
6.  Save `complaintDraft`.
7.  Create `COMPLAINT_PREPARED`.
8.  Return the draft.

### Acceptance criteria

-   Complaint is saved.
-   Timeline event is created.
-   Complaint remains a draft.
-   No official submission is claimed.

### What to test

-   Successful generation.
-   Unauthorized case.
-   AI failure.
-   Missing case information.

------------------------------------------------------------------------

## Task 24 --- Build complaint review UI

### Objective

Give the citizen explicit human control over the AI-generated complaint.

### Files/modules touched

-   complaint review components
-   case/report page

### Dependencies

Task 23.

### Implementation instructions

Show:

``` text
Formal Complaint
Review before handoff
```

Use an editable textarea/editor.

Display:

``` text
AI-assisted draft
Please review the facts before using this complaint.
```

Allow:

-   edit
-   save
-   continue to handoff

### Acceptance criteria

-   Complaint can be edited.
-   User can review before handoff.
-   Complaint remains a draft until explicit continuation.
-   Saving preserves edits.

### What to test

-   Generate.
-   Edit.
-   Save.
-   Refresh.
-   AI generation failure.

------------------------------------------------------------------------

# Phase 10 --- Handoff and Tracking

## Task 25 --- Implement configured reporting-channel data

### Objective

Provide trusted reporting-direction/channel information without asking
the AI to invent it.

### Files/modules touched

-   `lib/reporting/*`
-   configuration/constants

### Dependencies

Tasks 19 and 23.

### Implementation instructions

Create a small configured set for the demo.

The AI may recommend from configured context, but the application
remains the source of channel information.

Do not build a full authority directory.

### Acceptance criteria

-   Reporting channel is controlled by application configuration.
-   AI cannot create arbitrary URLs/contact numbers.
-   Unknown routing can be represented as uncertain.

### What to test

-   Known civic case.
-   Unknown category.
-   Invalid/missing configuration.

------------------------------------------------------------------------

## Task 26 --- Implement `POST /api/cases/:caseId/handoff`

### Objective

Record the official handoff state truthfully.

### Files/modules touched

-   `app/api/cases/[caseId]/handoff/route.ts`
-   handoff service
-   timeline service

### Dependencies

Tasks 7, 23, and 25.

### Implementation instructions

Require:

-   authenticated reporter
-   complaint draft
-   configured reporting direction/channel

Possible MVP state:

``` text
READY_FOR_OFFICIAL_HANDOFF
```

or:

``` text
HANDED_OFF
```

depending on what actually happens.

Never set:

``` text
CONFIRMED_OFFICIAL_SUBMISSION
```

without genuine external confirmation.

### Acceptance criteria

-   Handoff state is persisted.
-   Timeline event is created.
-   No false submission claim exists.
-   User is told exactly what CivicProof did.

### What to test

-   Handoff with valid complaint.
-   Handoff without complaint.
-   Unauthorized handoff.
-   Repeated handoff.
-   Missing channel.

------------------------------------------------------------------------

## Task 27 --- Build handoff/case-ID UI

### Objective

Show the citizen exactly what happens after complaint preparation.

### Files/modules touched

-   handoff UI
-   case tracking components

### Dependencies

Task 26.

### Implementation instructions

Display:

``` text
Ready for Official Handoff

Recommended reporting direction
...

Official channel
[ Continue to Official Channel ]

Important:
CivicProof does not claim official submission
unless the official system confirms it.

Your CivicProof Case
CP-2026-000184
```

Provide:

-   copy case ID
-   continue to official channel
-   view case status

### Acceptance criteria

-   Case ID is prominent.
-   Handoff state is truthful.
-   Official channel comes from trusted configuration.
-   No fake government confirmation is shown.

### What to test

-   Handoff success.
-   Handoff unavailable.
-   Mobile display.
-   Case ID copy.

------------------------------------------------------------------------

## Task 28 --- Connect complete citizen tracking flow

### Objective

Complete the citizen journey.

### Files/modules touched

-   case tracking page/components
-   routing/navigation only

### Dependencies

Tasks 17, 21, 24, and 27.

### Implementation instructions

Ensure the flow works:

``` text
Home
 ↓
Report
 ↓
Case created
 ↓
Evidence
 ↓
AI analysis
 ↓
Complaint
 ↓
Handoff
 ↓
Case tracking
```

Use one case page where possible instead of creating duplicate routes.

### Acceptance criteria

A fresh citizen can complete the full workflow without developer
intervention.

### What to test

Run the entire flow from a clean account.

------------------------------------------------------------------------

# Phase 11 --- Authority Workflow

## Task 29 --- Create authority case access rule

### Objective

Make an authority able to access only cases assigned/authorized to them.

### Files/modules touched

-   authority authorization helper
-   case query/service

### Dependencies

Task 7.

### Implementation instructions

For MVP:

``` text
currentUser.role === AUTHORITY
AND
case.authorityUserId === currentUser.id
```

Do not implement a full assignment system.

For the demo, authority assignment can be seeded or configured.

### Acceptance criteria

-   Authority can access assigned cases.
-   Authority cannot access unrelated cases.
-   Citizen cannot access authority-only operations.

### What to test

-   Assigned case.
-   Unassigned case.
-   Citizen attempting authority action.

------------------------------------------------------------------------

## Task 30 --- Build authority case review screen

### Objective

Give authority users a concise case-review interface.

### Files/modules touched

-   `app/authority/*`
-   `components/cases/AuthorityCaseView.*`

### Dependencies

Tasks 16 and 29.

### Implementation instructions

Show:

-   case ID
-   AI-assisted summary
-   original report
-   incident facts
-   evidence
-   severity suggestion
-   complaint
-   handoff state
-   timeline
-   authority actions

Keep the original citizen description visible.

### Acceptance criteria

-   Authority can understand a case quickly.
-   Original report remains distinguishable from AI output.
-   Evidence is permission-controlled.
-   No unrelated cases are shown.

### What to test

-   Assigned case.
-   Sensitive case.
-   No evidence.
-   No AI analysis.
-   Mobile/desktop.

------------------------------------------------------------------------

## Task 31 --- Implement authority status update API

### Objective

Allow an authority to record actual progress.

### Files/modules touched

-   `app/api/cases/[caseId]/status/route.ts`
-   case service
-   timeline service

### Dependencies

Tasks 7, 29, and 30.

### Implementation instructions

Allow only authority users with case access.

Keep statuses small:

``` text
IN_REVIEW
IN_PROGRESS
RESOLVED
```

When status changes:

1.  Update Case.
2.  Append `STATUS_UPDATED` timeline event.
3.  Store actor.

Do not let AI perform this action.

### Acceptance criteria

-   Authorized authority can update status.
-   Citizen sees new status.
-   Timeline records the event.
-   Unauthorized users are rejected.

### What to test

-   Valid update.
-   Unauthorized update.
-   Invalid status.
-   Repeated update.

------------------------------------------------------------------------

## Task 32 --- Build authority progress/resolution action UI

### Objective

Allow authority users to update progress and eventually record a
resolution.

### Files/modules touched

-   authority case view
-   status/progress forms

### Dependencies

Task 31.

### Implementation instructions

Add:

``` text
Update Status
Add Progress
Record Resolution
```

Use inline forms/modal rather than another large screen.

Resolution should require explicit authority action.

### Acceptance criteria

-   Authority can submit progress.
-   Authority can initiate resolution.
-   AI cannot mark a case resolved.
-   Changes appear in timeline.

### What to test

-   Status update.
-   Progress update.
-   Empty progress.
-   Resolution form.

------------------------------------------------------------------------

## Task 33 --- Implement `POST /api/cases/:caseId/resolution`

### Objective

Persist an actual authority-recorded resolution.

### Files/modules touched

-   `app/api/cases/[caseId]/resolution/route.ts`
-   case service
-   timeline service

### Dependencies

Tasks 31 and 32.

### Implementation instructions

Require:

-   authenticated authority
-   authorized case
-   meaningful resolution information

On success:

``` text
Case.status = RESOLVED
resolutionText = supplied authority text
resolvedAt = current timestamp
```

Append:

``` text
RESOLUTION_RECORDED
```

Do not infer resolution from an external-looking action.

### Acceptance criteria

-   Only authorized authority can resolve.
-   Resolution is persisted.
-   Timeline records resolution.
-   Citizen can subsequently see it.

### What to test

-   Valid resolution.
-   Unauthorized resolution.
-   Empty resolution.
-   Repeated resolution.

------------------------------------------------------------------------

## Task 34 --- Display resolution to the citizen

### Objective

Close the product loop.

### Files/modules touched

-   case tracking components

### Dependencies

Task 33.

### Implementation instructions

When resolved, show:

``` text
✓ Resolved

Resolution
[Recorded authority resolution]

Resolved on
[date]
```

Add the resolution event to the timeline.

If not resolved:

``` text
No resolution has been recorded yet.
```

### Acceptance criteria

The same citizen case that was created earlier can display the
authority's resolution without creating a second case.

### What to test

-   Resolved case.
-   In-progress case.
-   Refresh after resolution.
-   Mobile view.

------------------------------------------------------------------------

# Phase 12 --- Error Handling and Reliability

## Task 35 --- Add consistent API error responses

### Objective

Make backend failures predictable for the frontend.

### Files/modules touched

-   `lib/api/errors.*`
-   affected API routes

### Dependencies

Tasks 11--34.

### Implementation instructions

Standardize errors around:

``` text
400 validation
401 unauthenticated
403 unauthorized
404 not found
409 invalid state transition
413 oversized upload
415 unsupported file
422 insufficient data
429 rate limited
502 AI/storage provider failure
504 provider timeout
500 unexpected error
```

Do not expose internal stack traces.

### Acceptance criteria

-   API routes return consistent error shapes.
-   Internal details are not leaked.
-   Frontend can display useful messages.

### What to test

Trigger each relevant failure category.

------------------------------------------------------------------------

## Task 36 --- Add frontend loading states

### Objective

Make async operations understandable.

### Files/modules touched

-   report form
-   evidence uploader
-   AI cards
-   complaint editor
-   handoff UI
-   authority UI
-   case page

### Dependencies

Core feature tasks.

### Implementation instructions

Use concise states:

``` text
Creating your case…
Uploading evidence…
Analyzing your report…
Preparing your complaint…
Updating your case…
Recording resolution…
```

Disable duplicate actions during requests.

### Acceptance criteria

-   Every major async action has a visible loading state.
-   Buttons cannot accidentally submit multiple times.
-   Loading state does not destroy entered data.

### What to test

Throttle network where possible and observe every operation.

------------------------------------------------------------------------

## Task 37 --- Add frontend error states

### Objective

Ensure users know what happened and what they can do next.

### Files/modules touched

-   core screens/components

### Dependencies

Task 35.

### Implementation instructions

Every core operation should answer:

``` text
What happened?
Is my data safe?
What can I do next?
```

Examples:

``` text
AI analysis is temporarily unavailable.

Your case is still saved.
You can try again or continue without AI assistance.

[ Try Again ]
```

### Acceptance criteria

-   AI failure does not create fake results.
-   Upload failure does not destroy the case.
-   Database/API failure gives a retry path.
-   Handoff failure does not claim success.

### What to test

Simulate:

-   AI failure
-   storage failure
-   database failure
-   network failure
-   unauthorized request

------------------------------------------------------------------------

## Task 38 --- Add empty states

### Objective

Make normal "nothing yet" states understandable.

### Files/modules touched

-   case tracking
-   authority UI
-   AI components
-   evidence components

### Dependencies

Tasks 17, 21, and 30.

### Implementation instructions

Use useful empty states:

``` text
You don't have any CivicProof cases yet.
[ Report an Incident ]
```

``` text
No evidence has been attached.
```

``` text
AI assistance hasn't been run yet.
[ Analyze Case ]
```

``` text
No cases are currently assigned to you.
```

### Acceptance criteria

-   Empty states never say only "No data".
-   Each actionable empty state has an appropriate next action.

### What to test

Create empty/new accounts and empty cases.

------------------------------------------------------------------------

# Phase 13 --- Safety and Privacy Verification

## Task 39 --- Verify sensitive-case privacy boundaries

### Objective

Confirm that the most important safety requirement is enforced.

### Files/modules touched

Only modify authorization/storage/API code where a real defect is found.

### Dependencies

Tasks 7, 14, 16, 29, and 35.

### Implementation instructions

Test:

``` text
Citizen A
  ↓
Own sensitive case
  ✓ allowed

Citizen B
  ↓
Citizen A sensitive case
  ✗ denied

Unrelated Authority
  ↓
Sensitive case
  ✗ denied

Authorized Authority
  ↓
Assigned sensitive case
  ✓ allowed
```

Also verify:

-   case ID alone does not authorize access
-   evidence cannot be fetched by guessing a reference
-   sensitive data is not placed in public lists
-   no public offender feed exists

### Acceptance criteria

No unauthorized actor can access sensitive case data through normal API
routes.

### What to test

Perform direct API requests, not only UI tests.

------------------------------------------------------------------------

## Task 40 --- Verify AI safety boundaries

### Objective

Ensure AI remains an assistant rather than an authority.

### Files/modules touched

Only AI prompts/validation if required.

### Dependencies

Tasks 19--23.

### Implementation instructions

Test prompts/cases designed to tempt the model to:

-   invent laws
-   identify guilt
-   invent authorities
-   invent evidence
-   fabricate missing facts
-   claim submission
-   mark resolution

The application must prevent these from becoming trusted state.

### Acceptance criteria

-   Original user facts remain unchanged.
-   AI output is labeled.
-   AI cannot directly update permissions.
-   AI cannot submit.
-   AI cannot resolve.
-   AI failure creates no fake analysis.

### What to test

Use adversarial synthetic cases.

------------------------------------------------------------------------

# Phase 14 --- Testing

## Task 41 --- Create the main happy-path test

### Objective

Verify the complete product journey.

### Files/modules touched

-   test files only
-   no feature redesign

### Dependencies

Tasks 1--40.

### Implementation instructions

Test:

``` text
Citizen signs in
 ↓
Creates civic incident
 ↓
Uploads image
 ↓
AI analyzes
 ↓
Complaint generated
 ↓
Complaint reviewed
 ↓
Handoff recorded
 ↓
Case ID displayed
 ↓
Authority opens case
 ↓
Authority updates status
 ↓
Authority records resolution
 ↓
Citizen sees resolution
```

### Acceptance criteria

The entire flow works from a clean environment.

### What to test

Run the exact demo path end-to-end.

------------------------------------------------------------------------

## Task 42 --- Test sensitive-case journey

### Objective

Verify the private workflow.

### Files/modules touched

-   test files only

### Dependencies

Task 41.

### Implementation instructions

Test:

``` text
Citizen
 ↓
Selects safety/harassment
 ↓
Private indicator appears
 ↓
Safety guidance appears
 ↓
Case created privately
 ↓
Evidence remains private
 ↓
AI assistance remains labeled
 ↓
Authorized authority can access
 ↓
Unauthorized user cannot
```

### Acceptance criteria

Sensitive workflow never exposes the case publicly.

### What to test

UI plus direct API authorization.

------------------------------------------------------------------------

## Task 43 --- Test failure paths

### Objective

Verify that failures do not create false state.

### Files/modules touched

-   test files only unless defects are discovered

### Dependencies

Tasks 35--40.

### Implementation instructions

Test failures for:

-   AI
-   storage
-   database
-   network
-   invalid form
-   unauthorized access
-   missing case
-   invalid status
-   resolution failure

### Acceptance criteria

No failed operation falsely appears successful.

### What to test

Each failure scenario at least once.

------------------------------------------------------------------------

## Task 44 --- Run build/type/lint checks

### Objective

Catch technical defects before the demo.

### Files/modules touched

No feature files unless defects are found.

### Dependencies

All implementation tasks.

### Implementation instructions

Run:

``` text
npm run lint
npm run build
```

and the project's type-check/test commands.

Fix errors before adding new features.

### Acceptance criteria

-   Production build succeeds.
-   TypeScript has no blocking errors.
-   Lint passes or remaining warnings are understood.
-   Tests pass.

### What to test

Clean production build from the current repository state.

------------------------------------------------------------------------

# Phase 15 --- Demo Polish

## Task 45 --- Polish the citizen landing screen

### Objective

Make the product understandable within seconds.

### Files/modules touched

-   `app/page.tsx`
-   landing components only

### Dependencies

Task 44.

### Implementation instructions

Prioritize:

-   strong one-line value proposition
-   one primary CTA
-   clear workflow
-   privacy reassurance
-   clean spacing
-   mobile layout

Do not add new features.

### Acceptance criteria

A first-time visitor can explain the product after seeing the first
viewport.

### What to test

Show the landing screen to a teammate for 5--10 seconds and ask:

> "What does this product do?"

------------------------------------------------------------------------

## Task 46 --- Polish case timeline and status

### Objective

Make the tracking value visually obvious.

### Files/modules touched

-   timeline components
-   status components

### Dependencies

Task 44.

### Implementation instructions

Make the timeline visually scannable:

``` text
✓ Report created
✓ AI analysis
✓ Complaint prepared
✓ Handoff
● Authority review
○ Resolution
```

Use clear current-state emphasis.

### Acceptance criteria

User can understand the case's current state in a few seconds.

### What to test

-   New case
-   In-progress case
-   Resolved case
-   Mobile

------------------------------------------------------------------------

## Task 47 --- Polish AI trust presentation

### Objective

Make AI feel useful without making it look authoritative.

### Files/modules touched

-   AI analysis card
-   complaint review
-   severity component

### Dependencies

Task 44.

### Implementation instructions

Use labels such as:

``` text
AI-assisted summary
Suggested severity
Suggested reporting direction
AI-assisted complaint draft
```

Keep user facts visibly separate.

### Acceptance criteria

A user can distinguish:

``` text
What I reported
```

from:

``` text
What AI suggested
```

### What to test

Ask a teammate which text is user-provided and which is AI-generated.

------------------------------------------------------------------------

## Task 48 --- Add final responsive/accessibility pass

### Objective

Ensure the demo works reliably on common screen sizes.

### Files/modules touched

-   affected UI components only

### Dependencies

Tasks 45--47.

### Implementation instructions

Check:

-   mobile width
-   desktop width
-   keyboard navigation
-   visible focus
-   readable labels
-   button sizes
-   text overflow
-   upload controls
-   form errors

Do not redesign the entire application.

### Acceptance criteria

Core citizen flow is usable on mobile and desktop.

### What to test

At minimum:

-   phone-sized viewport
-   laptop-sized viewport
-   keyboard-only navigation through report form

------------------------------------------------------------------------

# Phase 16 --- Deployment

## Task 49 --- Configure production environment variables

### Objective

Prepare the deployed application without exposing secrets.

### Files/modules touched

-   Vercel environment configuration
-   `.env.example` only if documentation needs updating

### Dependencies

Tasks 3, 6, 18, and 13.

### Implementation instructions

Configure production values for:

``` text
DATABASE_URL
Clerk variables
OPENAI_API_KEY
storage variables
other required public configuration
```

Never commit secret values.

### Acceptance criteria

-   Production environment has required secrets.
-   Browser bundle does not contain private API keys.

### What to test

-   Inspect environment configuration.
-   Run deployed app.

------------------------------------------------------------------------

## Task 50 --- Deploy to Vercel

### Objective

Produce a stable public demo URL.

### Files/modules touched

-   deployment configuration only if required

### Dependencies

Task 49.

### Implementation instructions

1.  Push repository to GitHub.
2.  Import into Vercel.
3.  Configure environment variables.
4.  Deploy.
5.  Open production URL.
6.  Test the complete flow against the deployed database.

### Acceptance criteria

-   Public demo loads.
-   Authentication works.
-   Database works.
-   AI works.
-   Evidence upload works.
-   Citizen workflow works.
-   Authority workflow works.

### What to test

Run the exact final demo path against production.

------------------------------------------------------------------------

# Phase 17 --- Demo Preparation

## Task 51 --- Create safe synthetic demo data

### Objective

Prepare realistic but non-sensitive data for the presentation.

### Files/modules touched

-   seed/demo data only

### Dependencies

Task 50.

### Implementation instructions

Use a simple civic example such as:

``` text
Incident:
Large pothole near a bus stop

Evidence:
Synthetic pothole photograph

AI:
MEDIUM severity suggestion

Reporting direction:
Local civic authority

Complaint:
Generated formal draft

Authority:
Demo authority account

Resolution:
Synthetic authority resolution
```

Also prepare one sensitive-case example for explaining privacy, but do
not use real victim information.

### Acceptance criteria

-   Demo contains no real sensitive personal information.
-   Data tells a coherent story.
-   Case progresses through the entire workflow.

### What to test

Reset and rerun the demo if possible.

------------------------------------------------------------------------

## Task 52 --- Rehearse the 3-minute demo

### Objective

Demonstrate the product's value quickly.

### Files/modules touched

None unless demo defects are discovered.

### Dependencies

Tasks 45--51.

### Implementation instructions

Use this sequence:

``` text
1. Home
   ↓
2. Report a pothole
   ↓
3. Add evidence
   ↓
4. AI analyzes
   ↓
5. Show severity/reporting direction
   ↓
6. Generate complaint
   ↓
7. Review complaint
   ↓
8. Show truthful handoff
   ↓
9. Show case ID/timeline
   ↓
10. Switch to authority
   ↓
11. Update status
   ↓
12. Resolve
   ↓
13. Return to citizen
   ↓
14. Show resolution
```

During the presentation, emphasize:

> "CivicProof does not just generate a complaint. It creates a trackable
> path from incident to action."

### Acceptance criteria

The team can complete the demo without improvising technical setup.

### What to test

Run the demo twice consecutively.

------------------------------------------------------------------------

# 18. Hackathon Cut Line

If time becomes limited, stop adding features according to this
priority.

## Must finish

``` text
P0

Next.js UI
+
Database
+
Authentication
+
Create Case
+
Case ID
+
Evidence
+
AI Analysis
+
Complaint
+
Case Tracking
+
Authority Status
+
Resolution
```

## Can simplify

-   Evidence storage can support images only.
-   Authority assignment can be seeded.
-   Reporting directory can be tiny/configured.
-   Handoff can be a truthful "ready for official channel" state.
-   UI can use one reusable case page for multiple states.
-   Notifications can be omitted.
-   Advanced legal context can be omitted.

## Must NOT be added if time is running out

``` text
AI agents
RAG/legal engine
Deepfake detection
Public map
Public incident feed
Chat
Notifications
Automatic escalation
Government API integrations
Native mobile app
Advanced analytics
Microservices
Background jobs
Vector database
```

------------------------------------------------------------------------

# 19. Recommended 4-Hour Execution Order

A practical time-box is:

``` text
00:00–00:15
Project setup

00:15–00:35
Database + Prisma

00:35–00:50
Authentication

00:50–01:20
Core citizen UI

01:20–01:45
Create Case API + form connection

01:45–02:05
Evidence upload

02:05–02:35
AI analysis

02:35–02:55
Complaint generation

02:55–03:15
Handoff + case tracking

03:15–03:35
Authority workflow + resolution

03:35–03:50
Error states + testing

03:50–04:00
Demo polish + final rehearsal
```

These are **time-boxes, not promises**. If a task starts consuming
substantially more time than expected, simplify it rather than allowing
it to block the entire product.

------------------------------------------------------------------------

# 20. Coding-AI Session Rules

Because a coding AI will implement these tasks, every implementation
prompt should be narrowly scoped.

A good task prompt should say:

``` text
Read the relevant docs.

Implement only Task X from
docs/12-IMPLEMENTATION-PLAN.md.

Do not redesign unrelated modules.
Do not add features not specified in the task.
Inspect existing code before modifying it.
Keep the application runnable.
After implementation:
1. explain files changed
2. explain data flow
3. run relevant checks
4. report any remaining issues
```

The coding AI should **not** be told:

> "Build the entire CivicProof app."

That encourages uncontrolled architecture changes and consumes the
hackathon window.

------------------------------------------------------------------------

# 21. Definition of Done

The implementation is successful when the following journey works:

``` text
┌──────────────┐
│   Citizen    │
└──────┬───────┘
       ↓
 Report Incident
       ↓
 Add Details
       ↓
 Add Evidence
       ↓
 AI Analysis
       ↓
 Severity + Reporting Direction
       ↓
 Complaint Draft
       ↓
 Human Review
       ↓
 Official Handoff State
       ↓
 Case ID + Timeline
       ↓
┌──────────────┐
│  Authority   │
└──────┬───────┘
       ↓
 Review Case
       ↓
 Update Status
       ↓
 Record Resolution
       ↓
┌──────────────┐
│   Citizen    │
└──────┬───────┘
       ↓
 See Actual Resolution
```

And the following principles remain true:

1.  **The original report is preserved.**
2.  **Evidence is permission-controlled.**
3.  **AI output is labeled as AI-assisted.**
4.  **AI cannot determine guilt or liability.**
5.  **AI cannot change permissions.**
6.  **AI cannot claim official submission without confirmation.**
7.  **AI cannot mark cases resolved.**
8.  **Sensitive cases are private.**
9.  **Failed operations do not create fake state.**
10. **The complete product works before optional polish is added.**

> **Build the smallest complete CivicProof journey first. Then make that
> journey beautiful.**
