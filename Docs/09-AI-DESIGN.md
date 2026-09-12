# CivicProof — AI/ML Design

## Purpose

This document defines the minimum AI/ML architecture required by the CivicProof MVP.

It is derived from:

- `docs/01-PROBLEM.md`
- `docs/02-USER-RESEARCH.md`
- `docs/03-REQUIREMENTS.md`
- `docs/04-FEATURES.md`
- `docs/05-MVP.md`
- `docs/06-ARCHITECTURE-DECISION.md`

The goal is to use the **lowest-complexity AI approach that genuinely solves the MVP problem**.

---

# 1. AI Complexity Ladder

The available ladder is:

```text
No AI
   ↓
Traditional ML
   ↓
AI Model
   ↓
AI Assistant
   ↓
AI Agent
   ↓
Multi-Agent System
```

## Selected Level: AI Assistant

**CivicProof should use an AI Assistant, not an AI Agent.**

The AI is required because the MVP explicitly needs AI-assisted:

- incident structuring
- incident summarization
- severity suggestion
- reporting-direction assistance
- formal complaint generation

These are bounded transformations of information already supplied by the user.

The architecture document explicitly states that AI is **REQUIRED**, while agents/multi-step tool-using AI are **NOT REQUIRED**.

### Why AI Assistant is the lowest suitable level

### No AI — insufficient

Without AI, CivicProof could still collect reports and track cases, but it would lose the central MVP capability of converting an unstructured citizen description into a structured summary, severity suggestion, reporting guidance, and complaint draft.

### Traditional ML — unnecessarily restrictive

Traditional classification/regression models could potentially classify incident types or predict severity, but they are poorly suited to the MVP's combination of:

- free-form natural-language descriptions
- summarization
- structured extraction
- complaint drafting
- natural-language reporting guidance

Using several traditional ML models would actually increase system complexity.

### AI Model — technically possible, but the product needs an interaction layer

A general-purpose AI model can perform the underlying language tasks, but CivicProof needs bounded, application-controlled AI operations with structured inputs/outputs, safety rules, validation, and clear separation between user facts and AI interpretation.

That is best described as an **AI Assistant**.

### AI Agent — unnecessary

The AI does not need to:

- plan a multi-step objective independently
- select tools dynamically
- navigate government websites
- submit complaints autonomously
- wait for external results
- retry based on external outcomes
- maintain an autonomous task loop

The required operations can be invoked directly by the application.

### Multi-Agent System — clearly unnecessary

There is no independent need for specialized collaborating agents. Multiple agents would add complexity, latency, debugging difficulty, and safety risk without improving the MVP proof.

---

# 2. AI Responsibilities

The MVP AI Assistant has four bounded responsibilities.

```text
Citizen Case
     │
     ├──► Case Analysis
     │       ├── Structure
     │       ├── Summarize
     │       ├── Suggest severity
     │       └── Suggest reporting direction
     │
     └──► Complaint Generation
             └── Draft formal complaint
```

These operations should be exposed through application-controlled backend functions rather than allowing the AI to control the entire application.

---

# 3. AI Operation A — Case Analysis

## Purpose

Turn the reporter's supplied information into a structured, concise interpretation that helps the citizen and authority understand the case.

## Trigger

User explicitly requests:

```text
"Analyze my report"
```

or the corresponding UI action.

The analysis should not run autonomously in the background.

## Inputs

Only information necessary for the analysis, for example:

```json
{
  "incidentType": "POTHOLE",
  "description": "There is a large pothole near the main bus stop. Motorcycles are having difficulty passing safely.",
  "incidentDateTime": "2026-09-12T17:30:00+05:30",
  "location": "Main bus stop, Tirur"
}
```

Evidence metadata/context may be included where useful.

For sensitive cases, minimize unnecessary personal information.

## Outputs

The AI should return structured data such as:

```json
{
  "summary": "A large pothole has been reported near a bus stop and may create a road-safety hazard.",
  "structuredData": {
    "incidentType": "POTHOLE",
    "location": "Main bus stop, Tirur",
    "reportedImpact": "Difficulty for motorcycles and potential road-user hazard"
  },
  "severitySuggestion": "MEDIUM",
  "severityReason": "The supplied description indicates a public road hazard but does not establish an immediate emergency.",
  "reportingSuggestion": "Local civic authority",
  "reportingChannel": "Configured official civic complaint channel"
}
```

## AI decision logic

The AI should:

1. Read only supplied information.
2. Extract relevant facts.
3. Preserve uncertainty.
4. Produce a concise summary.
5. Suggest severity based only on available information.
6. Suggest a reporting direction based on configured/product-approved context where possible.
7. Explicitly identify uncertainty when the information is insufficient.

The AI should **not** fill gaps with guesses.

## Validation

The backend validates:

- required output fields exist
- severity belongs to an allowed set
- strings are within reasonable length limits
- structured data is valid JSON
- reporting guidance does not contain unsupported claims
- no unsupported facts are introduced

The original user description remains the source of user-provided facts.

AI output is stored separately as `AIAnalysis`.

---

# 4. AI Operation B — Complaint Generation

## Purpose

Convert the supplied case information into a clear, formal, reviewable complaint.

## Trigger

User explicitly clicks:

```text
"Generate Complaint"
```

## Inputs

The backend supplies:

```text
Original case information
+
Relevant AI analysis
+
Configured reporting context
```

Example:

```json
{
  "incidentType": "POTHOLE",
  "description": "There is a large pothole near the main bus stop.",
  "location": "Main bus stop, Tirur",
  "severitySuggestion": "MEDIUM",
  "reportingDirection": "Local civic authority"
}
```

## Output

```json
{
  "draft": "To the concerned authority,\n\nI am writing to report a large pothole near the main bus stop in Tirur. The reported condition is making it difficult for motorcycles to pass safely. I request that the concerned authority review the issue and take appropriate action.\n\nSincerely,\nReporter",
  "reviewRequired": true,
  "aiAssisted": true
}
```

## AI decision logic

The AI should:

1. Use only supplied case information.
2. Organize facts into formal complaint language.
3. Preserve uncertainty where appropriate.
4. Avoid unsupported allegations.
5. Avoid inventing evidence.
6. Avoid definitive legal conclusions.
7. Produce a draft that the reporter can edit and approve.

## Validation

The backend must verify:

- complaint is non-empty
- response is in the expected format
- no submission claim has been added
- no unsupported legal conclusion is presented as fact
- user-provided facts remain consistent
- `reviewRequired` remains true

The complaint remains a **draft** until the user reviews it.

---

# 5. Severity Suggestion

Severity is an AI-assisted assessment, not a legal or authoritative determination.

## Allowed conceptual levels

```text
LOW
MEDIUM
HIGH
URGENT
```

The exact set should remain small and consistent across the UI/database.

## Rules

The AI must:

- base the suggestion only on supplied information
- explain the main reason
- acknowledge uncertainty
- never fabricate circumstances to increase severity
- never represent severity as a legal classification

For example:

```text
Severity: HIGH

AI-assisted reason:
"The supplied report describes a serious safety concern. The assessment is based only on the information provided and is not an official risk determination."
```

For immediate danger, the application should show emergency guidance **without waiting for AI**.

---

# 6. Reporting-Direction Assistance

The AI can help answer:

> "Who or what type of authority should I report this to?"

However, this must be treated as **guidance**, not an authoritative routing decision.

## Decision hierarchy

The system should prefer:

```text
Known trusted/configured reporting information
             ↓
AI assistance using that context
             ↓
Explicit uncertainty if responsibility is unclear
```

The AI must not invent:

- authorities
- government departments
- URLs
- complaint portals
- contact numbers
- legal requirements

If no trusted reporting direction is available, the system should say that the appropriate authority could not be confidently established rather than hallucinating one.

---

# 7. Potentially Relevant Regulatory Context

This is P1 rather than a core AI operation.

If implemented, it should use a **curated/trusted knowledge source** rather than asking a general model to invent legal information.

Preferred architecture:

```text
Curated official/legal sources
          ↓
Relevant retrieved context
          ↓
AI explains the context
          ↓
User sees "Potentially Relevant Regulatory Context"
```

The AI must not:

- invent laws
- invent sections/provisions
- determine guilt
- determine criminal liability
- provide definitive legal advice

For the four-hour MVP, this capability can be deferred until the P0 AI workflow is reliable.

---

# 8. Is an Agent Required?

## Decision: NO

CivicProof does **not** require an AI agent.

The complete MVP AI journey can be represented as:

```text
User supplies information
          ↓
Application calls AI analysis
          ↓
Structured result
          ↓
Application stores result
          ↓
User requests complaint
          ↓
Application calls complaint generation
          ↓
Draft returned
          ↓
User reviews
```

Every step is explicitly triggered and controlled by the application or user.

There is no autonomous planning loop.

---

# 9. Why This Is AI Assistance, Not Agentic AI

An agent would be appropriate if CivicProof needed something like:

```text
"Handle this complaint completely."

        ↓
AI plans what to do
        ↓
Chooses a reporting authority
        ↓
Finds the official website
        ↓
Navigates the site
        ↓
Fills the form
        ↓
Uploads evidence
        ↓
Submits
        ↓
Checks the response
        ↓
Adapts if rejected
        ↓
Retries or finds another channel
```

That would involve:

- planning
- tool use
- external execution
- adapting to results
- potentially multiple steps
- meaningful autonomous permissions

The MVP does **none** of this.

Instead:

```text
"Summarize this"
"Suggest severity"
"Suggest reporting direction"
"Draft this complaint"
```

are bounded AI transformations.

Therefore:

> **CivicProof is AI-assisted, not agentic.**

---

# 10. Human Approval Boundaries

Human approval is important because CivicProof handles potentially sensitive incidents and official reporting.

## AI analysis

```text
AI generates analysis
        ↓
User/authority sees it as AI-assisted
        ↓
No approval needed to display a suggestion
```

The AI result must not itself trigger an external action.

## Complaint

```text
AI generates draft
        ↓
Human reviews/edits
        ↓
Human decides whether to use it
```

**Human approval is required before the complaint is handed off.**

## Official submission

```text
Complaint
   ↓
Human chooses to proceed
   ↓
Official channel/handoff
```

CivicProof must not autonomously submit a complaint.

If a real integration is added in a future version, submission should still have an explicit user/authorized-human action unless the authority and workflow specifically establish another safe mechanism.

## Resolution

AI must never mark a case resolved.

```text
Authority records resolution
        ↓
Backend records actual state
```

---

# 11. Permissions

Because sensitive cases are part of the MVP:

### AI access

The backend only calls AI after checking case authorization.

```text
Citizen
  ↓
Own case only

Authority
  ↓
Authorized/assigned cases only
```

The AI provider does not receive unrestricted database access.

The AI operation receives only the information necessary for that operation.

### AI cannot

- directly write arbitrary database fields
- change user roles
- change permissions
- expose private cases
- submit complaints
- mark cases resolved
- create authority acknowledgments
- access unrelated cases

The application backend remains the authority over these actions.

---

# 12. Memory

## MVP decision: No persistent AI memory

The AI does not need its own long-term conversational memory.

Each AI request can be constructed from:

```text
Current authorized case data
+
Current AI analysis, if needed
+
Configured trusted context, if needed
```

The database remains the source of persistent case state.

This avoids unnecessary:

- vector databases
- conversation-memory systems
- agent memory
- long-term AI profiles

Sensitive case information should not be retained by an AI component beyond what is required by the chosen provider's actual data-handling terms and the application's privacy design.

---

# 13. Failure Handling

AI is an important feature, but the case system must not become unusable when AI fails.

## AI provider unavailable

```text
AI request
    ↓
Provider failure
    ↓
Clear error
    ↓
Case remains available
```

Do not create a fake `AIAnalysis` record.

## Invalid AI response

```text
AI response
    ↓
Backend validation fails
    ↓
Reject response
    ↓
Show AI analysis unavailable/error
```

Do not blindly store malformed output.

## Timeout

Return a clear retry/fallback state.

## Rate limit

Show a temporary retry message.

## Insufficient information

AI should return an uncertainty state rather than inventing details.

Example:

```json
{
  "status": "INSUFFICIENT_INFORMATION",
  "message": "The report does not contain enough information to confidently suggest a reporting direction."
}
```

## Safety-sensitive situation

AI must never delay immediate safety guidance.

```text
Immediate danger
       ↓
Emergency/support guidance immediately
       ↓
AI is optional afterward
```

---

# 14. AI Output Validation

The backend should treat the AI as an **untrusted text-generation component**.

Validation should occur before storing or displaying important outputs.

## Validate

- JSON/schema shape
- enum values
- required fields
- maximum lengths
- empty/null values
- unsupported claims where practical
- explicit AI labeling

## Never trust AI for

```text
Identity
Authorization
Permissions
Official submission
Authority acknowledgment
Resolution state
Legal guilt/liability
Evidence authenticity
```

Those are application/authority-controlled states.

---

# 15. AI Data Flow

```text
┌─────────────────────┐
│ Citizen-provided    │
│ case information    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Backend authorization│
│ + data minimization │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ AI Assistant        │
│                     │
│ Structure           │
│ Summarize           │
│ Suggest severity    │
│ Suggest direction   │
│ Draft complaint     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Backend validation  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ AIAnalysis /        │
│ Case draft fields   │
└─────────────────────┘
```

The AI is therefore **inside a controlled backend workflow**, not in control of the product.

---

# 16. MVP AI Scope

## Must have

```text
✓ Incident structuring
✓ Incident summary
✓ Severity suggestion
✓ Reporting-direction assistance
✓ Complaint generation
✓ AI output labeling
✓ AI failure handling
```

## Should not be added during the four-hour MVP

```text
✗ Autonomous agents
✗ Multi-agent architecture
✗ AI-driven government website navigation
✗ Autonomous complaint submission
✗ AI legal decision engine
✗ Autonomous escalation
✗ Predictive policing/risk scoring
✗ Deepfake detection
✗ Forensic evidence verification
✗ AI-based guilt determination
✗ Persistent AI memory
✗ Vector database solely for AI memory
✗ Background AI workers
```

---

# 17. Final AI Architecture Decision

```text
AI Requirement
      ↓
AI Assistant
      ↓
┌───────────────────────────────┐
│ Bounded AI operations         │
│                               │
│ 1. Structure + summarize      │
│ 2. Suggest severity           │
│ 3. Suggest reporting direction│
│ 4. Generate complaint         │
└───────────────────────────────┘
      ↓
Backend validates output
      ↓
Database stores AI result
      ↓
Human reviews important actions
```

## Final decision

> **CivicProof requires an AI Assistant, but does not require an AI Agent or Multi-Agent System.**

The AI should be deliberately narrow, application-controlled, schema-validated, privacy-aware, and clearly separated from authoritative case state.

The key principle is:

> **Use AI to reduce the cognitive work of reporting — not to replace the citizen, authority, or legal system.**
