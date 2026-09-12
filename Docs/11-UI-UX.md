# CivicProof --- UI/UX Design

## Purpose

This document defines the **minimum screens required by the CivicProof
MVP**.

The design follows the existing MVP, architecture, database, API, AI,
and technology decisions. It intentionally avoids adding screens for
features that are outside the MVP.

The primary design goal is:

> **A citizen should understand what CivicProof does within seconds and
> be able to move from "something happened" to a structured, actionable
> case without feeling lost.**

The MVP is not a social network, public incident map, chat application,
legal-advice product, or autonomous government-submission system.

------------------------------------------------------------------------

# 1. Screen Flow

The MVP uses a small number of screens and reuses case components rather
than creating separate screens for every small action.

## Overall flow

``` text
┌────────────────┐
│  1. HOME /     │
│  REPORT START  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 2. CREATE      │
│    INCIDENT    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 3. CASE        │
│    ANALYSIS    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 4. COMPLAINT   │
│    REVIEW      │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 5. HANDOFF +   │
│    CASE ID     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 6. CASE        │
│    TRACKING    │
└────────────────┘
        │
        │ authority role
        ▼
┌────────────────┐
│ 7. AUTHORITY   │
│    CASE REVIEW │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ 8. RESOLUTION  │
│    / UPDATED   │
│    CASE        │
└────────────────┘
```

### Important implementation note

Screens 5 and 6 can be implemented as states of the same case page if
that is faster.

Likewise, screen 8 does not need to be a completely separate route. The
existing case screen can display the resolution once the authority
records it.

The screen count describes **user-facing states**, not necessarily eight
separate code routes.

------------------------------------------------------------------------

# 2. Screen 1 --- Home / Report Start

## Purpose

Immediately communicate the core value of CivicProof and give the
citizen one obvious next action.

The user should understand:

> **"I can turn a real-world problem into an evidence-backed case, get
> AI assistance, and track what happens next."**

within a few seconds.

## Which user sees it?

-   Citizen
-   Victim/reporting user
-   Any unauthenticated visitor before entering the protected reporting
    workflow

The authority workflow can have a separate authenticated entry point,
but it should not complicate the citizen landing experience.

## Core design

The hero section should be extremely simple:

``` text
CivicProof

Turn a real-world problem into an
actionable, trackable case.

Report what happened.
Add evidence.
Get AI-assisted guidance.
Track the case to resolution.

[ Report an Incident ]

Your sensitive reports are private.
```

### Supporting visual

A simple horizontal visual can reinforce:

``` text
Incident → Evidence → AI Assistance → Case → Resolution
```

Do not put a large dashboard, statistics wall, public map, or feature
carousel here.

## Components

-   CivicProof logo/name
-   Short value proposition
-   One primary CTA: **Report an Incident**
-   Small secondary action: **Track a Case** if needed
-   Privacy/sensitive-report reassurance
-   Minimal explanation of the workflow
-   Optional small sign-in/account action

## Inputs

No incident input yet.

Optional:

-   Authentication/sign-in action
-   Case tracking action

## Outputs

The user understands:

-   What CivicProof does
-   That evidence can be attached
-   That AI assists rather than makes legal decisions
-   That cases can be tracked
-   That sensitive reports are private

## Actions

-   **Report an Incident**
-   Sign in
-   Continue to case tracking if already authenticated

## Loading state

Normally none.

If authentication state is being restored:

``` text
Loading your CivicProof session…
```

Use a small page-level skeleton rather than a full-screen spinner.

## Error state

If authentication/session loading fails:

``` text
We couldn't restore your session.

[ Try Again ]
```

The report CTA should remain available if the application can safely
proceed to the authentication step.

## Empty state

Not applicable.

The landing page is intentionally not data-driven.

------------------------------------------------------------------------

# 3. Screen 2 --- Create Incident

## Purpose

Collect the minimum information required to turn an unstructured
real-world problem into a CivicProof case.

The form should feel more like:

> **"Tell us what happened."**

than a government form.

## Which user sees it?

**Citizen/reporting user**

## Components

### Header

``` text
Report an Incident
Step 1 of 3
```

### Incident type selector

Use clear cards/chips rather than a large dropdown.

Suggested MVP categories:

-   Civic Problem
-   Public Service Problem
-   Safety / Harassment

Sensitive categories should visibly indicate:

``` text
Private
```

### Description

Large textarea:

``` text
What happened?
Describe the problem in your own words.
```

Do not force users to understand legal terminology.

### Date/time

Optional.

### Location

Optional.

Use a simple text/location input for the MVP.

Do not make a map a required dependency.

### Evidence uploader

``` text
Add evidence (optional)

[ Upload Photo / File ]

Evidence helps explain what happened.
```

Show uploaded files as small cards.

### Sensitive-case indicator

When a sensitive incident is selected:

``` text
🔒 This report will be handled privately.
Only you and authorized case handlers can access it.
```

### Immediate safety guidance

For safety/harassment categories, show the safety action before normal
reporting actions where appropriate:

``` text
Are you in immediate danger?

[ Get Emergency / Safety Help ]
```

The user should never have to wait for AI analysis to see this.

### Primary CTA

``` text
Continue to AI Analysis →
```

## Inputs

-   Incident type
-   Description
-   Optional date/time
-   Optional location
-   Optional evidence files
-   Sensitive/private classification

## Outputs

After submission:

-   New case created
-   Case ID generated by backend
-   Case creation timeline event
-   User proceeds to AI analysis

## Actions

-   Select incident type
-   Enter description
-   Add date/time
-   Add location
-   Upload evidence
-   Remove an uploaded file
-   Trigger immediate safety guidance where relevant
-   Continue

## Loading state

When creating the case/uploading evidence:

``` text
Creating your case…
```

For AI preparation:

``` text
Preparing your report…
```

Disable duplicate submission.

Use progress indicators for upload where useful.

## Error state

Examples:

``` text
We couldn't create the case.
Your information has not been lost.

[ Try Again ]
```

For an upload failure:

``` text
This file couldn't be uploaded.
You can try again or continue without it.
```

For invalid form data:

``` text
Please describe what happened before continuing.
```

Do not silently discard entered information.

## Empty state

The form starts empty by design.

Helpful placeholder text should explain what belongs in each field.

The user should not be confronted with an empty dashboard or irrelevant
content.

------------------------------------------------------------------------

# 4. Screen 3 --- AI Case Analysis

## Purpose

Show the product's central intelligence:

> **CivicProof turns the citizen's raw report into something structured
> and actionable.**

This is the screen where the AI value should become obvious.

## Which user sees it?

-   Citizen
-   Authorized authority reviewing a case

The initial version is primarily for the citizen immediately after
report creation.

## Components

### Case summary

``` text
AI-Assisted Case Summary

A large pothole has been reported near a bus stop
and may create a road-safety hazard.
```

Clearly label the result:

``` text
AI-assisted
Based only on the information you provided.
```

### Structured details

Show extracted facts as simple fields:

``` text
Incident       Pothole
Location       Main bus stop
Reported impact Difficulty for road users
```

### Severity suggestion

A prominent but non-authoritative card:

``` text
Suggested Severity
MEDIUM

Why:
The report describes a public road hazard,
but does not establish an immediate emergency.

AI-assisted assessment — not an official risk determination.
```

### Reporting direction

``` text
Suggested Reporting Direction

Local civic authority

Reporting channel:
Official local civic complaint channel
```

This should be visibly presented as a recommendation.

### Potentially Relevant Regulatory Context

Only show this if the P1 capability is actually implemented.

For the four-hour MVP it can be omitted.

### Primary CTA

``` text
Generate Formal Complaint →
```

### Secondary action

``` text
Edit Report
```

## Inputs

Normally none beyond the case already created.

Optional:

-   User-triggered "Analyze again" if supported

## Outputs

-   AI-generated summary
-   Structured case data
-   Severity suggestion
-   Severity reason
-   Reporting-direction recommendation
-   Reporting-channel information where configured

## Actions

-   Review AI result
-   Return/edit the report
-   Generate complaint

The user does **not** approve an AI legal decision because no such
decision exists.

## Loading state

This screen needs an important loading experience.

``` text
Analyzing your report…

✓ Reading incident details
✓ Structuring the report
○ Assessing severity
○ Preparing reporting guidance
```

Do not claim individual AI steps completed if the application is
actually making one request.

A safer presentation is:

``` text
Analyzing your report…

CivicProof is preparing an AI-assisted summary,
severity suggestion, and reporting direction.
```

## Error state

``` text
AI analysis is temporarily unavailable.

Your case is safe and has not been lost.
You can continue without AI assistance.

[ Try Again ]
[ Continue to Case ]
```

Never show a fake AI result.

## Empty state

If analysis has not yet been requested:

``` text
Your case is ready for AI assistance.

CivicProof can summarize the report,
suggest severity, and help identify where to report it.

[ Analyze My Report ]
```

------------------------------------------------------------------------

# 5. Screen 4 --- Complaint Review

## Purpose

Turn the structured case into a usable formal complaint while keeping
the human in control.

The central principle is:

> **AI drafts. The citizen decides.**

## Which user sees it?

-   Citizen/reporting user
-   Authorized authority where appropriate

## Components

### Header

``` text
Formal Complaint
Review before handoff
```

### Editable complaint editor

Large text area/editor containing the generated draft.

Example structure:

``` text
To the concerned authority,

I am writing to report…

[complaint text]
```

### AI notice

``` text
AI-assisted draft
Please review the facts before using this complaint.
```

### Case facts sidebar/card

Show the source facts that generated the draft:

-   Incident type
-   Date/time
-   Location
-   Evidence attached
-   Suggested reporting direction

This helps the user verify that the complaint has not changed the
underlying facts.

### Primary CTA

``` text
Save & Continue to Official Handoff →
```

### Secondary CTA

``` text
Back to Analysis
```

## Inputs

-   Complaint draft
-   User edits

## Outputs

-   Final user-reviewed complaint draft
-   Saved `complaintDraft`
-   Timeline event indicating complaint preparation

## Actions

-   Edit complaint
-   Save changes
-   Continue to official handoff
-   Return to analysis

## Loading state

When generating the draft:

``` text
Preparing your complaint…
```

When saving:

``` text
Saving complaint…
```

## Error state

AI generation failure:

``` text
We couldn't generate the complaint right now.

Your case is still available.
You can write or edit the complaint manually.

[ Try Again ]
[ Continue Manually ]
```

Save failure:

``` text
We couldn't save your changes.

[ Try Again ]
```

Do not lose the editor contents.

## Empty state

If no complaint exists:

``` text
No complaint draft has been created yet.

[ Generate Complaint ]
```

If the AI cannot generate one because the case lacks sufficient
information:

``` text
There isn't enough information to generate a reliable draft.

Add more details to your incident report and try again.
```

------------------------------------------------------------------------

# 6. Screen 5 --- Official Handoff + Case ID

## Purpose

Move the citizen from the prepared complaint toward the appropriate
official reporting channel while being completely truthful about what
CivicProof has and has not submitted.

This screen is critical for trust.

## Which user sees it?

**Citizen/reporting user**

## Components

### Handoff status

Before action:

``` text
Ready for Official Handoff

Your complaint is ready to continue through
the appropriate official channel.
```

### Reporting direction

``` text
Recommended reporting direction
Local civic authority

Official channel
[ Open Official Channel ]
```

The actual URL/channel must come from trusted configured application
data.

### Truthfulness notice

``` text
Important:
CivicProof does not claim that your complaint has been
officially submitted unless the official system confirms it.
```

### Primary CTA

Depending on the real integration:

``` text
Continue to Official Channel →
```

or, if the MVP only records handoff:

``` text
Mark as Ready for Handoff
```

Do not imply that clicking a button submitted the complaint to a
government system.

### Case reference

After the handoff state is recorded:

``` text
Your CivicProof Case

CP-2026-000184
```

### Next action

``` text
[ View Case Status ]
```

## Inputs

-   User confirmation to proceed
-   Handoff action

No arbitrary authority URLs should be accepted from the client.

## Outputs

-   Handoff state
-   Case ID
-   Timeline event
-   Link/instructions for the official channel

## Actions

-   Review complaint
-   Continue to official channel
-   Record supported handoff state
-   Copy case ID
-   View case

## Loading state

``` text
Preparing official handoff…
```

After action:

``` text
Updating your case…
```

## Error state

``` text
We couldn't update the handoff status.

Your case and complaint are still saved.

[ Try Again ]
```

If the configured channel is unavailable:

``` text
The official reporting channel is temporarily unavailable.

Your CivicProof case is safe.
Please try the official channel again later.
```

## Empty state

If no complaint exists:

``` text
Your complaint is not ready yet.

[ Review Complaint ]
```

If reporting direction is unknown:

``` text
We couldn't confidently identify a reporting direction.

Please review the available reporting options manually.
```

Never invent a government department or contact number.

------------------------------------------------------------------------

# 7. Screen 6 --- Case Tracking

## Purpose

Give the citizen a persistent place to see what has actually happened to
their case.

This proves CivicProof is more than a complaint-writing tool.

## Which user sees it?

**Citizen/reporting user**

## Components

### Case header

``` text
Case CP-2026-000184
Pothole

Status
In Review
```

### Status timeline

Example:

``` text
✓ Report created
  12 Sep, 5:30 PM

✓ AI analysis completed
  12 Sep, 5:31 PM

✓ Complaint prepared
  12 Sep, 5:32 PM

✓ Official handoff
  12 Sep, 5:33 PM

● Authority review
  In progress
```

Only actual recorded events should be shown as completed.

### Incident summary

-   Incident type
-   Description
-   Location
-   Date/time
-   Sensitive/private indicator

### Evidence

Show attached evidence with permission-aware access.

### AI assistance

Show:

-   Summary
-   Severity suggestion
-   Reporting direction

Clearly labeled as AI-assisted.

### Complaint

Show the current complaint draft/status.

### Resolution

If resolved:

``` text
Resolution

The reported issue was reviewed and corrective
action was recorded.

Resolved on: 14 Sep 2026
```

### Primary navigation

``` text
[ Back to My Cases ]
```

## Inputs

No required form inputs.

Optional:

-   Case ID if the user uses a case lookup flow
-   Navigation/filtering if multiple own cases are supported

## Outputs

-   Current case status
-   Timeline
-   Evidence metadata/access
-   AI analysis
-   Complaint/handoff state
-   Resolution information

## Actions

-   View case
-   View evidence
-   Review complaint
-   Copy case ID
-   Return to cases
-   Refresh status if needed

No public sharing of sensitive cases.

## Loading state

Use a case-detail skeleton:

``` text
Loading case…
```

Skeleton sections:

-   Status
-   Timeline
-   Details
-   Evidence
-   AI analysis

## Error state

``` text
We couldn't load this case.

It may be temporarily unavailable.

[ Try Again ]
```

For unauthorized access:

``` text
This case is not available to your account.
```

Do not leak whether a sensitive case exists if the authorization model
calls for a generic not-found response.

## Empty state

For a user with no cases:

``` text
You don't have any CivicProof cases yet.

[ Report an Incident ]
```

For a case with no evidence:

``` text
No evidence has been attached to this case.
```

For a case with no AI analysis:

``` text
AI assistance hasn't been run for this case yet.

[ Analyze Case ]
```

------------------------------------------------------------------------

# 8. Screen 7 --- Authority Case Review

## Purpose

Provide the receiving authority user with a concise, actionable view of
a case.

The authority should not have to read a long citizen submission to
understand the important information.

## Which user sees it?

**AUTHORITY user**

## Components

### Authority header

``` text
Case Review
CP-2026-000184
```

### Priority/AI severity

``` text
AI-Suggested Severity
MEDIUM
```

Clearly distinguish this from an official priority classification.

### Case summary

``` text
AI-Assisted Summary

A large pothole has been reported near...
```

### Original report

Keep the citizen's original description visible.

This is important because AI output is interpretation, not the source of
truth.

### Incident facts

-   Incident type
-   Date/time
-   Location
-   Reporter-provided details

### Evidence

Permission-controlled evidence viewer.

### Complaint / handoff

Show:

-   Complaint
-   Handoff state
-   Official channel information

### Timeline

Show the complete case history.

### Authority actions

``` text
Update Status
```

Status options should remain small and meaningful, for example:

``` text
IN_REVIEW
IN_PROGRESS
RESOLVED
```

### Progress input

``` text
Add progress information
[ text area ]

[ Update Case ]
```

### Resolution action

When appropriate:

``` text
Record Resolution
```

This can use an inline form/modal rather than another dedicated screen.

## Inputs

-   Status
-   Progress description
-   Resolution information

## Outputs

-   Updated case status
-   New timeline events
-   Resolution state when recorded

## Actions

-   Review case
-   View evidence
-   Update status
-   Add progress
-   Record resolution

Authority users cannot:

-   change citizen roles
-   access unrelated cases
-   expose sensitive cases publicly
-   claim an external submission occurred when it did not

## Loading state

When loading:

``` text
Loading case review…
```

When updating:

``` text
Updating case…
```

Disable the action button while the request is in progress.

## Error state

``` text
We couldn't update this case.

No change has been recorded.

[ Try Again ]
```

Unauthorized action:

``` text
You are not authorized to perform this action.
```

## Empty state

If there are no cases assigned/authorized to the authority:

``` text
No cases are currently assigned to you.
```

Do not add a complex authority case-management dashboard just to avoid
an empty state.

------------------------------------------------------------------------

# 9. Screen 8 --- Resolution / Updated Case

## Purpose

Close the product loop by showing the citizen that a real recorded
authority update changed the case state.

This is not necessarily a separate route. It is the **resolved state of
the Case Tracking screen**.

## Which user sees it?

-   Citizen
-   Authorized authority

The citizen sees the result; the authority creates it.

## Components

### Resolved status

``` text
✓ Resolved

Case CP-2026-000184
```

### Resolution information

``` text
Resolution

[Recorded authority resolution]
```

### Resolution date

``` text
Resolved on
14 Sep 2026
```

### Timeline

The timeline gains:

``` text
✓ Resolution recorded
```

### Original case information

Remain available for context.

## Inputs

### Citizen

None.

### Authority

-   Resolution text
-   Resolution action

## Outputs

-   `Case.status = RESOLVED`
-   `resolutionText`
-   `resolvedAt`
-   `RESOLUTION_RECORDED` timeline event

## Actions

### Citizen

-   View resolution
-   View timeline
-   Return to cases
-   Start a new report

### Authority

-   Record resolution
-   Return to case

## Loading state

Citizen:

``` text
Loading latest case status…
```

Authority:

``` text
Recording resolution…
```

## Error state

Authority:

``` text
We couldn't record the resolution.

The case has not been marked as resolved.

[ Try Again ]
```

Citizen:

``` text
We couldn't load the latest case status.

[ Try Again ]
```

## Empty state

If the case is not resolved:

``` text
No resolution has been recorded yet.

Current status: In Progress
```

This is preferable to pretending a resolution exists.

------------------------------------------------------------------------

# 10. Navigation Model

The MVP should use **minimal navigation**.

## Citizen navigation

``` text
CivicProof
├── Report Incident
├── My Cases
└── Account / Sign Out
```

The primary action should always remain easy to find.

## Authority navigation

``` text
CivicProof
├── Assigned Cases
└── Account / Sign Out
```

Do not build a large administrative sidebar unless the actual UI needs
it.

------------------------------------------------------------------------

# 11. Responsive Design

The citizen experience is explicitly mobile-friendly.

## Mobile-first priority

The most important screens to optimize for mobile are:

1.  Home
2.  Create Incident
3.  AI Analysis
4.  Complaint Review
5.  Handoff
6.  Case Tracking

## Mobile layout rules

-   Single-column layout
-   Large touch targets
-   Large text input
-   Sticky primary CTA where helpful
-   Evidence upload optimized for phone camera/file picker
-   Avoid wide tables
-   Avoid dense dashboards
-   Keep status/timeline cards vertically stacked
-   Make privacy state visible without overwhelming the screen

## Desktop

Desktop can use:

``` text
Main content       Supporting information
────────────       ─────────────────────
Case/report        AI summary
                   Severity
                   Reporting direction
```

But the mobile layout remains the source of truth for citizen workflow.

------------------------------------------------------------------------

# 12. Sensitive Incident UX

Sensitive cases need a visibly different trust experience without
creating a separate product.

## At report creation

When the user selects a sensitive category:

``` text
🔒 Private Report

This case is private by default.
Only you and authorized case handlers can access it.
```

## During AI analysis

Show:

``` text
AI-assisted
Only the information necessary for this analysis is used.
```

Do not expose sensitive data in public URLs or public case lists.

## During case tracking

Show:

``` text
🔒 Private Case
```

Never display:

-   alleged-offender public profiles
-   public accusations
-   public case feeds
-   public sensitive evidence

## Immediate danger

The safety action should be available **before** AI analysis.

Example:

``` text
If you are in immediate danger:

[ Get Emergency Help ]

You do not need to wait for CivicProof analysis.
```

The product must not make emergency help dependent on an AI request.

------------------------------------------------------------------------

# 13. AI UX Rules

AI should look like an assistant, not an authority.

## Good labels

Use:

-   **AI-assisted summary**
-   **Suggested severity**
-   **Suggested reporting direction**
-   **AI-assisted complaint draft**

Avoid:

-   "Legal decision"
-   "Confirmed offence"
-   "Guilty"
-   "Official severity"
-   "Guaranteed authority"
-   "Complaint successfully filed" unless genuinely confirmed

## Visual distinction

AI output should be visually separated from original facts.

For example:

``` text
YOUR REPORT
───────────
"There is a large pothole..."

AI-ASSISTED ANALYSIS
────────────────────
"May create a road-safety hazard."
```

This prevents the interface from accidentally presenting AI
interpretation as user-provided fact.

------------------------------------------------------------------------

# 14. Loading, Error, and Empty-State Design Principles

These states are part of the product, not afterthoughts.

## Loading

Prefer informative messages:

``` text
Creating your case…
Analyzing your report…
Preparing your complaint…
Updating your case…
```

Avoid unexplained infinite spinners.

## Errors

Every error should answer:

1.  What happened?
2.  Is my data safe?
3.  What can I do next?

Example:

``` text
AI analysis is unavailable.

Your case is still saved.
You can try again or continue without AI assistance.

[ Try Again ]
```

## Empty states

Every empty state should provide a useful next action.

Bad:

``` text
No data.
```

Good:

``` text
You don't have any cases yet.

[ Report an Incident ]
```

------------------------------------------------------------------------

# 15. Core Value Within Seconds

The first screen should **not** begin with:

-   Login wall
-   Dashboard
-   Statistics
-   Long explanation
-   Feature list
-   Government terminology
-   Legal disclaimers

Instead, the first viewport should communicate:

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

Immediately underneath:

``` text
Incident → Evidence → AI → Case → Resolution
```

And a short privacy reassurance:

``` text
Sensitive reports are private.
```

## Why this works

The visitor can answer three questions almost immediately:

### 1. What is this?

A system for turning real-world incidents into trackable cases.

### 2. What makes it different?

It combines:

``` text
Evidence
+
AI assistance
+
Reporting direction
+
Case tracking
```

instead of being only a complaint form.

### 3. What should I do?

There is one obvious action:

``` text
Report an Incident
```

That gets the user into the actual product instead of making them study
the interface.

------------------------------------------------------------------------

# 16. Screen Discipline --- What We Are NOT Building

To protect the four-hour scope, the following screens are intentionally
excluded:

  -----------------------------------------------------------------------
  Screen                  Decision                Reason
  ----------------------- ----------------------- -----------------------
  Public incident feed    **NO**                  Not in MVP; conflicts
                                                  with sensitive-case
                                                  privacy.

  Public incident map     **NO**                  Not required.

  Social/community feed   **NO**                  Not part of core
                                                  journey.

  Chat screen             **NO**                  Real-time chat is
                                                  outside MVP.

  Notifications center    **NO**                  Notifications are
                                                  outside MVP.

  Legal advice screen     **NO**                  AI must not act as a
                                                  legal decision engine.

  Advanced                **NO**                  Evidence
  evidence-forensics                              attachment/review is
  screen                                          sufficient.

  Deepfake detector       **NO**                  Outside CivicProof MVP.

  AI agent control panel  **NO**                  Agents are not
                                                  required.

  Analytics dashboard     **NO**                  Not needed to prove the
                                                  product journey.

  Complex authority       **NO**                  Authority management is
  administration                                  outside MVP.

  Government integration  **NO**                  Direct integrations are
  management                                      optional.

  Native mobile screens   **NO**                  Mobile-friendly web is
                                                  the requirement.

  Separate                **NO**                  Not necessary for the
  settings/product tour                           demo.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 17. MVP Screen Checklist

Before calling the UI complete, the following must work:

## Citizen

-   [ ] Home clearly explains CivicProof
-   [ ] Report Incident CTA is obvious
-   [ ] Incident type can be selected
-   [ ] Citizen can describe what happened
-   [ ] Date/time can be supplied
-   [ ] Location can be supplied
-   [ ] Evidence can be attached
-   [ ] Sensitive cases visibly become private
-   [ ] Immediate safety guidance is available for relevant incidents
-   [ ] AI analysis can be requested
-   [ ] AI summary is displayed
-   [ ] Severity suggestion is displayed
-   [ ] Reporting direction is displayed
-   [ ] Complaint can be generated
-   [ ] Complaint can be edited
-   [ ] Official handoff state is shown truthfully
-   [ ] Case ID is displayed
-   [ ] Case timeline is displayed
-   [ ] Authority updates become visible
-   [ ] Resolution becomes visible

## Authority

-   [ ] Authority can authenticate
-   [ ] Authority can access authorized cases
-   [ ] Authority can see original report
-   [ ] Authority can see evidence
-   [ ] Authority can see AI assistance
-   [ ] Authority can see severity
-   [ ] Authority can see timeline
-   [ ] Authority can update status
-   [ ] Authority can add progress
-   [ ] Authority can record resolution

## Safety and trust

-   [ ] Sensitive cases are not public
-   [ ] Sensitive evidence is permission-controlled
-   [ ] AI output is clearly labeled
-   [ ] AI cannot change permissions
-   [ ] AI cannot claim official submission
-   [ ] AI cannot mark a case resolved
-   [ ] Failed AI calls do not create fake results
-   [ ] Failed updates do not falsely change case state
-   [ ] Empty/error/loading states exist for core operations

------------------------------------------------------------------------

# Final UX Principle

CivicProof should feel like:

> **"Tell us what happened. We'll help you turn it into a clear case,
> guide you toward the right reporting path, and let you track what
> actually happens."**

---not like a complicated government portal.

The UI should make the product's strongest differentiator visible
immediately:

``` text
REAL-WORLD PROBLEM
        ↓
     EVIDENCE
        ↓
   AI ASSISTANCE
        ↓
 CLEAR COMPLAINT
        ↓
 OFFICIAL HANDOFF
        ↓
   TRACKABLE CASE
        ↓
 AUTHORITY ACTION
        ↓
    RESOLUTION
```

**One complete, trustworthy journey beats a large collection of
unfinished screens.**
