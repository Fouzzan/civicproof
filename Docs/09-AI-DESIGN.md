# 09 — AI / Agent Design

This document formalizes the AI-agent design for the MVP defined in `01-PROBLEM.md` through `06-ARCHITECTURE-DECISION.md`.

The design keeps the agent genuinely useful and agentic while avoiding unnecessary multi-agent or autonomous-agent complexity.

---

# 1. Agent Overview

## Agent Name

**Sahayak**

> *Sahayak* means "helper" and reflects the product's role as a citizen-facing assistant that helps translate everyday situations into government-service actions.

## Complexity Level

**AI Agent — single agent with tool use**

The MVP uses one agent that can:

- Understand a citizen's natural-language situation.
- Maintain the facts gathered during the interaction.
- Decide what information is still missing.
- Choose the appropriate tool/action.
- Ask targeted follow-up questions.
- Evaluate eligibility using controlled scheme rules.
- Prepare an application.
- Wait for explicit user confirmation.
- Trigger simulated submission.
- Retrieve application status later.

A multi-agent system is intentionally excluded because the MVP has one focused end-to-end journey and does not require multiple autonomous specialists.

---

# 2. Agent Responsibilities

Sahayak is responsible for coordinating the citizen journey:

```text
Citizen message
      ↓
Understand situation
      ↓
Extract / update known facts
      ↓
Determine next required step
      ↓
Ask only for missing information
      ↓
Match supported scheme(s)
      ↓
Evaluate eligibility
      ↓
Explain result
      ↓
Prepare application
      ↓
Show application for review
      ↓
Wait for explicit confirmation
      ↓
Simulated submission
      ↓
Return tracking ID
      ↓
Later: retrieve application status
```

The agent coordinates these steps, but it does **not** become the authoritative source of eligibility rules.

---

# 3. AI vs. Deterministic Logic

A core architecture principle is to separate language understanding from rule-based eligibility decisions.

```text
Citizen's natural-language message
              ↓
          Sahayak / AI
              ↓
     Structured user facts
              ↓
   Controlled scheme rules
              ↓
   Deterministic evaluation
              ↓
       Eligibility result
              ↓
       Sahayak explains
```

## AI is responsible for

- Understanding natural-language descriptions.
- Extracting structured facts from user messages.
- Identifying the user's intent.
- Identifying which required facts are missing.
- Choosing the next appropriate action/tool.
- Asking questions in plain language.
- Explaining structured results.
- Helping map confirmed information into application fields.
- Handling natural-language status requests.

## Deterministic logic is responsible for

- The authoritative eligibility criteria used by the MVP.
- Checking structured facts against those criteria.
- Determining which eligibility conditions passed or failed.
- Validating required application information.
- Enforcing state transitions.
- Preventing submission before explicit confirmation.
- Creating and retrieving application/tracking state.

### Important rule

> **The LLM may interpret the user's information, but it must not invent or decide the official eligibility rules.**

This follows the architecture decision that eligibility must be grounded in controlled scheme rules.

---

# 4. Agent State and Memory

Sahayak needs state across turns so the citizen does not have to repeat information.

This is **application/conversation memory**, not a sophisticated long-term memory system.

## State that should be retained

```text
User facts
    ├── Facts provided by the citizen
    ├── Facts extracted from previous messages
    └── Confirmed/corrected facts

Journey state
    ├── Current intent
    ├── Selected scheme
    ├── Missing facts
    └── Eligibility result

Application state
    ├── Draft application
    ├── User corrections
    ├── Confirmation state
    ├── Submission state
    └── Tracking ID

Status state
    └── Current simulated application status
```

## Memory requirements

The agent must:

1. Reuse facts already provided by the citizen.
2. Respect corrections made by the citizen.
3. Avoid asking for information that is already known and valid.
4. Preserve the selected scheme during the current application flow.
5. Preserve application/tracking state after simulated submission.
6. Allow a later status request to resolve to the submitted application.

## Memory boundary

The MVP does **not** require:

- General-purpose long-term personal memory.
- User profiling beyond what is needed for the application.
- Background memory summarization systems.
- Persistent conversational history for unrelated topics.

Only information needed to complete or retrieve the application should be retained.

---

# 5. Tool Architecture

Sahayak uses five controlled tools:

| Tool | Purpose |
|---|---|
| **SchemeMatcher** | Match the citizen's situation to supported candidate scheme(s) |
| **EligibilityChecker** | Evaluate scheme rules against known facts |
| **FormFiller** | Prepare an application from gathered facts |
| **ApplicationSubmitter** | Perform simulated submission and return tracking ID |
| **StatusTracker** | Retrieve and report simulated application status |

The tools are backend capabilities controlled by the application. They are not arbitrary functions exposed directly to the citizen.

---

# 6. Tool — SchemeMatcher

## Name

**SchemeMatcher**

## Purpose

Determine which supported scheme(s) may be relevant to the citizen's situation.

The tool works only against the scheme(s) configured for the MVP.

## Trigger

Sahayak invokes `SchemeMatcher` when:

- The citizen first describes their situation.
- New information changes the understanding of their situation.
- The current scheme is uncertain.
- Multiple supported schemes may potentially apply.

For the current MVP, only one demonstration scheme is expected, but the tool should support multiple candidate results conceptually because the broader product scope allows 1–2 schemes.

## Inputs

Conceptually:

```json
{
  "userFacts": {
    "age": 62,
    "incomeBracket": "LOW",
    "residency": "QUALIFIED"
  },
  "situationSummary": "Citizen is seeking government financial support."
}
```

Inputs should contain structured facts and relevant situation information already gathered from the citizen.

## Outputs

```json
{
  "matches": [
    {
      "schemeId": "scheme-001",
      "match": true
    }
  ],
  "needsMoreInformation": [],
  "reason": "The known facts are consistent with the supported scheme."
}
```

Possible outcomes:

- One supported scheme matches.
- Multiple supported schemes match.
- No supported scheme matches.
- More information is required before matching can be determined.

## Permissions

**Read-only access to:**

- Supported scheme definitions.
- Controlled scheme metadata.
- Matching criteria.

The tool must not:

- Modify applications.
- Submit applications.
- Modify user identity.
- Change eligibility rules.

## Failure Handling

If scheme data is unavailable:

- Return a controlled tool error.
- Do not invent a scheme.
- Do not allow the LLM to substitute an imagined government scheme.

If the user's information is insufficient:

- Return the missing information needed for matching.
- Sahayak asks the citizen targeted questions.

If multiple schemes match:

- Sahayak presents the supported candidates clearly.
- The citizen chooses which scheme to continue with.

If no supported scheme matches:

- Sahayak explains that no currently supported scheme appears applicable.
- It must not fabricate another scheme.

## Validation

The backend validates:

- Scheme IDs exist.
- Returned schemes are currently supported.
- Matching output has the expected structure.
- Facts used for matching have valid types/values.
- The tool does not return unsupported schemes.
- No match is treated as authoritative eligibility by itself.

---

# 7. Tool — EligibilityChecker

## Name

**EligibilityChecker**

## Purpose

Evaluate the citizen's known facts against the controlled eligibility rules of the selected supported scheme.

This is the **authoritative eligibility evaluation mechanism for the MVP**, not the LLM.

## Trigger

Sahayak invokes `EligibilityChecker` when:

- A scheme has been selected.
- All facts required for the eligibility decision are available.
- A user changes/corrects an eligibility fact and the result must be recalculated.

## Inputs

```json
{
  "schemeId": "scheme-001",
  "facts": {
    "age": 62,
    "incomeBracket": "LOW",
    "residency": "QUALIFIED"
  }
}
```

## Outputs

```json
{
  "result": "LIKELY_ELIGIBLE",
  "criteria": [
    {
      "name": "Age",
      "passed": true
    },
    {
      "name": "Income",
      "passed": true
    },
    {
      "name": "Residency",
      "passed": true
    }
  ],
  "missingFacts": []
}
```

Possible results:

- `LIKELY_ELIGIBLE`
- `NOT_ELIGIBLE`
- `MORE_INFORMATION_NEEDED`

The result should include enough structured information for Sahayak to explain the outcome.

## Permissions

**Read-only access to:**

- Selected scheme.
- Controlled eligibility rules.
- Structured user facts.

The tool may produce an evaluation result but must not modify official scheme rules.

## Failure Handling

If required facts are missing:

- Do not guess values.
- Return the missing facts.
- Sahayak asks only the necessary questions.

If facts are contradictory:

- Flag the contradiction.
- Ask the citizen to clarify/correct the information.

If the scheme does not exist:

- Return a controlled error.
- Do not perform evaluation against an invented scheme.

If rule data is unavailable:

- Fail safely rather than allowing the LLM to make up a result.

## Validation

The backend validates:

- The scheme exists and is supported.
- The scheme has a valid eligibility rule definition.
- Every required fact has the correct type/allowed value.
- Missing facts are detected before evaluation.
- The result corresponds to the configured rules.
- A `LIKELY_ELIGIBLE` result cannot be returned when required facts are missing.
- Eligibility rules cannot be modified through this tool.
- The LLM cannot override the returned deterministic result.

---

# 8. Tool — FormFiller

## Name

**FormFiller**

## Purpose

Prepare a draft application from information already gathered and confirmed during the conversation.

The goal is to eliminate unnecessary manual re-entry of information while keeping the citizen in control.

## Trigger

Sahayak invokes `FormFiller` when:

- A supported scheme has been selected.
- Eligibility has been successfully evaluated as likely eligible.
- The required application information is available.
- The application needs to be prepared for citizen review.

It may also be invoked again after the citizen corrects application information.

## Inputs

```json
{
  "schemeId": "scheme-001",
  "userFacts": {
    "age": 62,
    "incomeBracket": "LOW",
    "residency": "QUALIFIED"
  }
}
```

## Outputs

```json
{
  "application": {
    "schemeId": "scheme-001",
    "fields": {
      "age": 62,
      "incomeBracket": "LOW",
      "residency": "QUALIFIED"
    }
  },
  "missingFields": []
}
```

The output is a **draft**, not a submitted application.

## Permissions

**Read:**

- Confirmed user facts.
- Selected scheme application-field definition.

**Write:**

- Draft application state only.

The tool must not:

- Submit the application.
- Generate a tracking ID.
- Change eligibility rules.
- Treat inferred information as user-confirmed without appropriate indication.

## Failure Handling

If required information is missing:

- Return the missing fields.
- Sahayak asks the citizen only for the necessary information.

If an application field cannot be mapped reliably:

- Leave it unresolved rather than inventing a value.
- Ask the citizen for clarification where necessary.

If the user corrects a value:

- The corrected value becomes the source for the revised draft.

## Validation

The backend validates:

- The scheme is supported.
- Application fields are valid for that scheme.
- Values come from gathered/confirmed citizen information.
- Required fields are present before the application can proceed to confirmation.
- Draft application state is associated with the correct session/application context.
- No submission occurs as a side effect of form generation.

---

# 9. Tool — ApplicationSubmitter

## Name

**ApplicationSubmitter**

## Purpose

Perform the hackathon's **simulated application submission** and generate a tracking ID.

It demonstrates the submission stage without connecting to a real government backend.

## Trigger

Sahayak may invoke `ApplicationSubmitter` **only after explicit citizen confirmation** of the prepared application.

Examples of explicit confirmation include:

- "Yes, submit it."
- "Everything is correct."
- "Confirm and submit."

A normal conversational message must never be interpreted as implicit submission approval.

## Inputs

```json
{
  "applicationId": "app-001",
  "confirmed": true
}
```

The backend should use the persisted, user-confirmed application rather than trusting arbitrary application data supplied by the model.

## Outputs

```json
{
  "success": true,
  "trackingId": "DEMO-123456",
  "status": "SUBMITTED",
  "simulation": true
}
```

## Permissions

**Write access to:**

- Simulated application submission state.
- Tracking ID.
- Simulated initial status.

It must not have access to:

- Real government systems.
- Real government submission APIs.
- Unrelated applications.

## Failure Handling

If confirmation is missing:

- Reject the operation.
- Do not submit.

If the application is incomplete:

- Reject the operation.
- Return the missing information needed before submission.

If the application has already been submitted:

- Reject duplicate submission.
- Return the existing submission state where appropriate.

If persistence fails:

- Do not falsely tell the citizen that submission succeeded.
- Return a safe failure.

## Validation

The backend must validate:

- The application exists.
- The application belongs to the current demo/user context.
- The application is complete.
- The application has passed the required eligibility/application checks.
- Explicit confirmation is present and valid.
- The application has not already been submitted.
- A unique tracking ID is generated.
- Submission is recorded as simulated.
- No real government endpoint is called.

### Critical safety rule

> **No tool call, model response, or conversational shortcut may bypass explicit human confirmation before simulated submission.**

---

# 10. Tool — StatusTracker

## Name

**StatusTracker**

## Purpose

Retrieve the current simulated status of a previously submitted application.

This enables the later interaction:

> "What's my status?"

## Trigger

Sahayak invokes `StatusTracker` when:

- The citizen asks for application status.
- The citizen provides a tracking ID.
- The conversation state contains a previously submitted application that can be identified.

## Inputs

```json
{
  "trackingId": "DEMO-123456"
}
```

Where possible, the backend should also use the current demo/session ownership context.

## Outputs

```json
{
  "trackingId": "DEMO-123456",
  "status": "UNDER_REVIEW",
  "simulation": true
}
```

Possible MVP statuses may include:

```text
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
```

The exact simulated progression is intentionally minimal.

## Permissions

**Read-only access to:**

- Simulated application records.
- Simulated status.

The tool must not:

- Create applications.
- Change eligibility.
- Submit applications.
- Invent statuses.

## Failure Handling

If no tracking ID is available:

- Sahayak asks for the tracking ID or uses available session context if possible.

If the application cannot be found:

- Clearly report that no matching simulated application was found.
- Do not invent a status.

If the application belongs to another demo/user context:

- Deny access.

If the database is unavailable:

- Return a controlled failure rather than fabricating a result.

## Validation

The backend validates:

- Tracking ID format.
- Application existence.
- Application ownership/session association where applicable.
- Status is one of the allowed simulated values.
- The returned record is actually submitted.
- `simulation` is always true for MVP status.
- No real government status is implied.

---

# 11. Agent Decision Logic

Sahayak should follow a controlled decision process rather than freely deciding what to do at every turn.

## High-Level Decision Tree

```text
START
  │
  ▼
Understand user message
  │
  ├── Status request? ───────────────► StatusTracker
  │
  ▼
Do we understand the user's need?
  │
  ├── No ─► Ask clarification
  │
  ▼
SchemeMatcher
  │
  ├── No supported match ─► Explain limitation
  │
  ├── Multiple matches ───► Ask user to choose
  │
  ▼
Are eligibility facts complete?
  │
  ├── No ─► Ask only missing questions
  │
  ▼
EligibilityChecker
  │
  ├── MORE_INFORMATION_NEEDED ─► Ask missing questions
  │
  ├── NOT_ELIGIBLE ────────────► Explain failed criterion
  │
  ▼
LIKELY_ELIGIBLE
  │
  ▼
FormFiller
  │
  ▼
Show application
  │
  ▼
Wait for user review/corrections
  │
  ├── Corrections ─► Update facts / regenerate draft
  │
  ▼
Explicit confirmation?
  │
  ├── No ─► Continue review
  │
  ▼
ApplicationSubmitter
  │
  ▼
Tracking ID
  │
  ▼
Later status request
  │
  ▼
StatusTracker
```

---

# 12. Ask-Only-What-Is-Missing Strategy

One of Sahayak's most important behaviors is avoiding a raw form-like interaction.

The agent should:

1. Extract every usable fact from the citizen's message.
2. Compare known facts with the requirements for the current step.
3. Identify only the missing information needed to continue.
4. Ask for the smallest useful set of information.
5. Re-evaluate after receiving the answer.

### Example

User:

> "I'm 62 and my income is low. I live here permanently and need financial support."

If those facts are sufficient:

```text
Known:
✓ Age
✓ Income
✓ Residency

Next:
→ Evaluate eligibility
```

If residency is missing:

```text
Known:
✓ Age
✓ Income

Missing:
? Residency

Ask:
"Do you currently live in this state permanently?"
```

The agent should not ask unrelated questions simply because they appear on the eventual application form.

---

# 13. Multiple Scheme Handling

Although the MVP focuses on one demonstration scheme, the agent design supports the broader 1–2 scheme constraint.

If multiple supported schemes match:

```text
SchemeMatcher
      ↓
Candidate A
Candidate B
      ↓
Sahayak explains both simply
      ↓
Citizen chooses
      ↓
Continue with selected scheme
```

The agent must **not silently choose between materially different schemes** when the citizen needs to make that choice.

If only one supported scheme matches, the agent can continue automatically.

---

# 14. Ineligibility Handling

When `EligibilityChecker` returns `NOT_ELIGIBLE`, Sahayak should explain the result using the structured evaluation.

Example structure:

```text
You do not appear eligible for this scheme because
the current rules require [criterion], and the information
you provided does not meet that requirement.

If the rules allow the result to change, I can explain
what condition would need to be different.
```

The explanation must be grounded in the failed criterion.

The agent must not:

- Invent another eligibility requirement.
- Invent another scheme.
- Promise future eligibility.
- Suggest changing truthful information merely to qualify.
- Present an uncertain interpretation as a confirmed government decision.

---

# 15. Human Approval Boundary

Human approval is mandatory before simulated submission.

```text
AI prepares application
        ↓
Application shown to citizen
        ↓
Citizen reviews
        ↓
Citizen may correct information
        ↓
Citizen explicitly confirms
        ↓
ApplicationSubmitter
```

This provides a clear human-in-the-loop boundary.

## Why this matters

The application may contain:

- Personal information.
- AI-extracted facts.
- User-provided information.
- Potentially misunderstood information.

The citizen therefore remains the final authority over what is submitted in the simulation.

---

# 16. Agentic Behavior vs. Fixed Automation

Sahayak is intentionally **agentic**, but not because it is simply an LLM connected to tools.

The agentic behavior comes from its ability to interpret the current state and choose the next appropriate action based on the user's evolving situation.

## Fixed automation would look like

```text
Step 1 → Ask Question A
Step 2 → Ask Question B
Step 3 → Ask Question C
Step 4 → Check eligibility
Step 5 → Fill form
Step 6 → Submit
```

This would follow the same predetermined path regardless of what the citizen says.

## Sahayak behaves differently

```text
User message
    ↓
Understand what is already known
    ↓
Determine current state
    ↓
Determine what is missing
    ↓
Choose the next appropriate action/tool
    ↓
Update state
    ↓
Choose the next action
```

For example:

- If the user already provided age, Sahayak does not ask for age again.
- If the user changes their income, Sahayak can update the fact and re-evaluate eligibility.
- If multiple schemes match, Sahayak asks the citizen to choose.
- If the user asks for status later, Sahayak switches from application-building behavior to status retrieval.
- If the user is ineligible, Sahayak explains the failed criterion rather than continuing toward form submission.
- If the application is awaiting confirmation, Sahayak does not submit until the citizen explicitly confirms.

### Therefore

> **The agent is a state-aware decision-maker that selects among controlled tools and conversation actions according to the user's current situation and application state.**

It is not a fixed sequence of API calls.

---

# 17. Tool Permissions Summary

| Tool | Read | Write | Can submit? | Can change rules? |
|---|---|---|---:|---:|
| SchemeMatcher | Scheme definitions | None | No | No |
| EligibilityChecker | Scheme rules + user facts | Evaluation state if needed | No | No |
| FormFiller | User facts + scheme fields | Draft application | No | No |
| ApplicationSubmitter | Confirmed application | Submission + tracking state | **Yes — simulated only** | No |
| StatusTracker | Submitted applications/status | None | No | No |

The agent should have access only to the tools needed for the current workflow.

---

# 18. Failure and Safety Principles

Sahayak should fail safely rather than produce a confident but unsupported answer.

## Core rules

### 1. Never fabricate scheme information

If a scheme is not configured as supported, the agent must not claim to support it.

### 2. Never fabricate eligibility rules

Eligibility must come from the controlled scheme rule definition.

### 3. Never guess missing facts

Ask the citizen instead.

### 4. Never silently overwrite user corrections

The latest confirmed user information should take precedence.

### 5. Never submit without confirmation

Submission requires explicit human approval.

### 6. Never fabricate status

If no application is found, say so.

### 7. Keep simulation explicit

The agent must clearly communicate that submission and status are simulated.

### 8. Validate model output

Structured output from the LLM must be validated before it can affect application state or trigger tools.

### 9. Keep tool boundaries strict

The LLM should not directly manipulate database state or bypass backend validation.

---

# 19. Example End-to-End Agent Trace

## Step 1 — User describes situation

```text
User:
"I am 62, have a low income, and need government support."
```

Sahayak extracts:

```json
{
  "age": 62,
  "incomeBracket": "LOW"
}
```

It identifies missing information and asks the next relevant question.

---

## Step 2 — User provides missing information

```text
User:
"I have lived here permanently for many years."
```

Sahayak updates:

```json
{
  "age": 62,
  "incomeBracket": "LOW",
  "residency": "QUALIFIED"
}
```

---

## Step 3 — Eligibility

Sahayak invokes:

```text
EligibilityChecker
```

The controlled rules return:

```text
LIKELY_ELIGIBLE
```

Sahayak explains the result in plain language.

---

## Step 4 — Application preparation

Sahayak invokes:

```text
FormFiller
```

The citizen sees the prepared application.

---

## Step 5 — Review

The citizen changes a value if necessary.

Sahayak updates the application and does not silently retain the old value.

---

## Step 6 — Confirmation

Sahayak asks:

```text
"Please review these details. Would you like me to submit
this application in the demo system?"
```

The citizen explicitly confirms.

---

## Step 7 — Simulated submission

Sahayak invokes:

```text
ApplicationSubmitter
```

Result:

```json
{
  "trackingId": "DEMO-123456",
  "status": "SUBMITTED",
  "simulation": true
}
```

---

## Step 8 — Later status request

```text
User:
"What's my status?"
```

Sahayak identifies the relevant application and invokes:

```text
StatusTracker
```

The result is presented as simulated status information.

---

# 20. Agent Architecture

```text
┌──────────────────────────────────────┐
│          Citizen-facing UI           │
│       Natural-language chat          │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│             SAHAYAK                  │
│          Single AI Agent             │
│                                      │
│  Understand → Decide → Ask → Act     │
│                                      │
│  Maintains conversation/application  │
│  state and selects controlled tools  │
└───────────────┬──────────────────────┘
                │
       ┌────────┼─────────┬──────────────┐
       │        │         │              │
       ▼        ▼         ▼              ▼
 Scheme      Eligibility Form       Application
 Matcher      Checker    Filler      Submitter
       │        │         │              │
       └────────┴─────────┴──────────────┘
                       │
                       ▼
                StatusTracker
                       │
                       ▼
              Persistent application
                     state
```

The LLM is used inside Sahayak for language understanding, extraction, conversation, and explanation. The tools provide controlled business operations.

---

# 21. Final Agent Design Decision

The MVP will use:

| Capability | Decision |
|---|---|
| Agent name | **Sahayak** |
| Agent type | **Single AI agent with tool use** |
| Multi-agent system | **Excluded** |
| Autonomous background operation | **Excluded** |
| Long-term memory | **Excluded** |
| Conversation/application state | **Required** |
| Scheme matching | **Controlled tool** |
| Eligibility evaluation | **Deterministic/rule-based tool** |
| Application generation | **Controlled tool** |
| Submission | **Simulated tool** |
| Status lookup | **Controlled tool** |
| Human approval before submission | **Required** |
| Real government integration | **Excluded** |

## Final principle

> **Sahayak should be agentic enough to understand a citizen's changing situation, maintain state, ask only what is needed, select the right controlled action, and continue the journey across multiple turns — while deterministic backend rules remain responsible for eligibility and critical state transitions.**

This gives the hackathon a genuine **AI-agent** implementation without introducing unnecessary multi-agent architecture or autonomous complexity.
