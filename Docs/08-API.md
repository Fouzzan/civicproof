# 08 — API Design

This document defines the minimum API surface required by the MVP described in `01-PROBLEM.md` through `07-DATABASE.md`.

The API is an **internal frontend-to-backend boundary**. It is not a public API and does not integrate with real government systems.

Specific technologies and providers are intentionally not defined here.

---

# 1. API Architecture

The MVP has two distinct types of communication:

```text
┌─────────────────────┐
│   Citizen-facing UI │
└──────────┬──────────┘
           │
           │ Frontend → Backend API
           ▼
┌─────────────────────┐
│  Backend / Agent    │
│     Orchestrator    │
└───────┬───────┬─────┘
        │       │
        │       │ Backend → LLM API
        │       ▼
        │  ┌───────────┐
        │  │    LLM    │
        │  │  service  │
        │  └───────────┘
        │
        ▼
┌─────────────────────┐
│ Scheme rules + DB   │
└─────────────────────┘
```

### Frontend → Backend

These are the product's internal API endpoints and are defined in this document.

### Backend → LLM

The backend may call an LLM provider to perform language understanding, conversation, extraction, and explanation. This is **not exposed directly to the frontend** and is intentionally described separately below.

---

# 2. Endpoint Summary

The MVP needs only three frontend-facing endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/chat` | Continue the agent interaction and perform the next required action |
| `GET` | `/api/schemes` | Retrieve the supported scheme information needed by the UI/agent |
| `GET` | `/api/application/:id` | Retrieve a user's simulated application/status by tracking ID |

No real government API endpoints are required.

---

# 3. POST `/api/chat`

## Purpose

Accept a user's message and return the agent's next response/action.

This is the primary conversational endpoint and supports the multi-step MVP flow:

```text
Describe situation
      ↓
Ask questions
      ↓
Collect facts
      ↓
Evaluate eligibility
      ↓
Explain result
      ↓
Prepare application
      ↓
Review / confirm
      ↓
Simulated submission
```

It may also support a later status request by routing the request to the appropriate application/status operation.

---

## Auth

**MVP:** No full authentication required.

The request must nevertheless contain enough demo/session context for the backend to associate the conversation and application with the same demo user.

The exact session/identity mechanism is an implementation decision and is not specified here.

---

## Request Shape

```json
{
  "message": "I am 62 years old and have a low income. I want to know if I qualify.",
  "sessionId": "demo-session-123"
}
```

### Fields

| Field | Required | Purpose |
|---|---:|---|
| `message` | Yes | The citizen's latest natural-language message. |
| `sessionId` | Yes | Identifies the active demo conversation/application context. |

---

## Response Shape

The response should provide the next agent message and enough structured information for the UI to render the current stage.

Example:

```json
{
  "message": "I can help you check that. What is your current residency status?",
  "action": "ASK_QUESTION",
  "state": {
    "schemeId": "scheme-001",
    "eligibility": "PENDING"
  }
}
```

### Possible actions

The MVP should use a small controlled set of actions:

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

The exact response contract can be refined during implementation, but the action set should remain small and tied to the user journey.

---

## Example — Initial Message

### Request

```json
{
  "message": "I am 62 and I need government financial support.",
  "sessionId": "demo-session-123"
}
```

### Response

```json
{
  "message": "I may be able to help. What is your monthly income?",
  "action": "ASK_QUESTION",
  "state": {
    "schemeId": "scheme-001",
    "eligibility": "PENDING"
  }
}
```

---

## Example — Eligibility Result

### Request

```json
{
  "message": "My monthly income is within the required income bracket.",
  "sessionId": "demo-session-123"
}
```

### Response

```json
{
  "message": "Based on the information you've provided, you appear eligible for this scheme because you meet the required age, income, and residency conditions.",
  "action": "SHOW_ELIGIBILITY",
  "state": {
    "schemeId": "scheme-001",
    "eligibility": "LIKELY_ELIGIBLE"
  }
}
```

---

## Example — Application Confirmation

### Response

```json
{
  "message": "I've prepared your application. Please review the information before I submit it.",
  "action": "REQUEST_CONFIRMATION",
  "application": {
    "id": "app-001",
    "schemeId": "scheme-001",
    "fields": {
      "age": 62,
      "incomeBracket": "LOW",
      "residency": "QUALIFIED"
    }
  }
}
```

---

## Example — Simulated Submission

After explicit user confirmation:

```json
{
  "message": "Your application has been submitted in the demo system. This is a simulated submission.",
  "action": "SUBMITTED",
  "application": {
    "id": "app-001",
    "trackingId": "DEMO-123456",
    "status": "SUBMITTED"
  }
}
```

---

## Validation

The backend should validate:

- `message` exists and is a string.
- `message` is not empty.
- `message` is within a reasonable length limit.
- `sessionId` exists and is valid for the demo context.
- Conversation/application state belongs to that session.
- Actions that require an existing application cannot be performed without one.
- Submission cannot occur without explicit user confirmation.
- Eligibility cannot be represented as confirmed when required information is missing.

---

## Error Cases

### `400 Bad Request`

Use when:

- `message` is missing.
- `message` is empty.
- `message` has an invalid shape.
- `sessionId` is missing or malformed.

Example:

```json
{
  "error": "Invalid request",
  "message": "A non-empty message is required."
}
```

### `404 Not Found`

Use when the referenced conversation/application context cannot be found.

```json
{
  "error": "Session not found",
  "message": "The current application session could not be found."
}
```

### `409 Conflict`

Use when the requested action conflicts with the current application state.

Example:

```json
{
  "error": "Invalid application state",
  "message": "This application has already been submitted."
}
```

### `422 Unprocessable Entity`

Use when the message is valid but cannot yet support the requested action because required information is missing or contradictory.

```json
{
  "error": "More information required",
  "message": "I need one more piece of information before checking eligibility."
}
```

### `500 Internal Server Error`

Use for unexpected backend failures.

The response should not expose internal implementation details.

---

## Side Effects

Depending on the current agent state, `/api/chat` may:

- Update conversation/application state.
- Store newly collected user facts.
- Create or update a draft application.
- Evaluate eligibility against scheme rules.
- Prepare application data.
- Record user confirmation.
- Trigger simulated submission.
- Create/assign a tracking ID.
- Update simulated application status.

A normal conversational message should not automatically submit an application.

---

# 4. GET `/api/schemes`

## Purpose

Return the supported scheme information needed by the MVP.

Because the MVP supports one demonstration scheme, this endpoint may return a single scheme.

---

## Auth

**MVP:** No full authentication required.

The endpoint exposes only the scheme information intended to be used by the demo.

---

## Request

No request body.

Example:

```text
GET /api/schemes
```

---

## Response Shape

```json
{
  "schemes": [
    {
      "id": "scheme-001",
      "name": "Demo Welfare Support Scheme",
      "requiredFields": [
        "age",
        "incomeBracket",
        "residency"
      ]
    }
  ]
}
```

### Important boundary

The endpoint does not need to expose internal implementation details of the eligibility engine.

Whether full `eligibility_rules` are returned to the frontend is an implementation/security decision; the backend remains the authoritative source for evaluating eligibility.

---

## Validation

No complex input validation is required because this is a collection endpoint with no request body.

The backend should ensure that returned scheme data is:

- Valid.
- Complete enough for the MVP.
- Limited to supported scheme(s).

---

## Error Cases

### `500 Internal Server Error`

If the scheme data cannot be retrieved.

```json
{
  "error": "Scheme data unavailable",
  "message": "Supported scheme information could not be loaded."
}
```

---

## Side Effects

**None.**

The endpoint is read-only.

---

# 5. GET `/api/application/:id`

## Purpose

Retrieve a simulated application and its current status using the application's tracking ID.

This supports the later user journey:

> "What's my status?"

---

## Auth

**MVP:** No full authentication required.

The backend must still enforce the demo ownership/session boundary where possible so one demo user's application is not accidentally exposed to another.

---

## Request

The `:id` path parameter represents the **tracking ID**.

Example:

```text
GET /api/application/DEMO-123456
```

---

## Response Shape

```json
{
  "application": {
    "trackingId": "DEMO-123456",
    "schemeId": "scheme-001",
    "status": "UNDER_REVIEW",
    "submittedAt": "2026-09-12T10:30:00Z",
    "simulation": true
  }
}
```

### Status values

The MVP may use a small controlled set such as:

```text
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
```

The exact simulated progression should remain minimal.

---

## Validation

The backend should validate:

- Tracking ID is present.
- Tracking ID has a valid format.
- The application exists.
- The application belongs to the requesting demo context where applicable.

---

## Error Cases

### `400 Bad Request`

Invalid tracking ID format.

```json
{
  "error": "Invalid tracking ID",
  "message": "The tracking ID format is not valid."
}
```

### `404 Not Found`

No matching application exists.

```json
{
  "error": "Application not found",
  "message": "No application was found for this tracking ID."
}
```

The service must **not invent a status** when an application cannot be found.

### `403 Forbidden`

Use if the tracking ID exists but the current demo context is not permitted to access it.

```json
{
  "error": "Access denied",
  "message": "You cannot access this application."
}
```

---

## Side Effects

**None.**

This endpoint is read-only.

---

# 6. Frontend → Backend API Summary

```text
┌─────────────────────┐
│     Frontend UI     │
└─────────┬───────────┘
          │
          ├── POST /api/chat
          │      └─ Conversation + agent actions
          │
          ├── GET /api/schemes
          │      └─ Supported scheme information
          │
          └── GET /api/application/:id
                 └─ Application/status lookup
```

These are the only frontend-facing API operations required by the current MVP.

---

# 7. Backend → LLM API

The LLM provider is **not called directly by the frontend**.

The backend/agent orchestrator may call an LLM for tasks such as:

### Language understanding

```text
Citizen message
      ↓
LLM
      ↓
Structured interpretation
```

Example conceptual output:

```json
{
  "intent": "CHECK_ELIGIBILITY",
  "facts": {
    "age": 62,
    "incomeBracket": "LOW"
  },
  "missingFacts": [
    "residency"
  ]
}
```

### Conversational response generation

The LLM may turn structured state into a plain-language response:

```text
"I just need to know your residency status before I can check this."
```

### Application assistance

The LLM may help map already-confirmed citizen information into application fields.

### Important boundary

The LLM should **not be treated as the authoritative source of scheme eligibility rules**.

The controlled flow should be:

```text
Citizen message
      ↓
LLM understands/extracts facts
      ↓
Structured facts
      ↓
Defined scheme rules
      ↓
Eligibility evaluation
      ↓
Agent explains result
```

The backend should also validate structured LLM output before using it to change application state.

---

# 8. Backend → LLM Error Handling

LLM failures should not expose provider-specific details to the citizen.

Possible internal failures include:

- Provider unavailable.
- Timeout.
- Invalid model response.
- Malformed structured output.
- Safety/filter refusal.
- Rate limit.

The backend should convert these into a safe application-level response, for example:

```json
{
  "error": "Agent temporarily unavailable",
  "message": "I couldn't process that request right now. Please try again."
}
```

The exact fallback behavior is an implementation decision.

---

# 9. What Is Intentionally Not an API

The MVP does **not** require endpoints for:

- Real government submission.
- Real government status.
- Document upload.
- OCR.
- Multiple-scheme management.
- Department routing.
- Proactive reminders.
- Public API access.
- User registration/authentication.

These are outside the current MVP scope.

---

# 10. API Design Principles

### Keep the API small

Three frontend-facing endpoints are sufficient for the current MVP.

### Keep business logic on the backend

Scheme rules, eligibility evaluation, application state, and simulated submission should not depend on frontend-only logic.

### Keep the LLM behind the backend

The frontend should never call the LLM provider directly for the agent workflow.

### Keep state controlled

Only valid state transitions should be allowed, especially around application confirmation and submission.

### Never fabricate

The API must not return:

- Invented eligibility rules.
- Invented application statuses.
- Unsupported scheme information.
- A claim that a real government submission occurred.

### Make simulation explicit

Application submission and status responses must clearly indicate that they are simulated.

---

# 11. Final MVP API Contract

```text
FRONTEND
   │
   ├── POST /api/chat
   │      │
   │      └── Agent workflow
   │              ├── Understand
   │              ├── Ask
   │              ├── Evaluate
   │              ├── Explain
   │              ├── Prepare
   │              ├── Confirm
   │              └── Simulate submission
   │
   ├── GET /api/schemes
   │      └── Supported scheme information
   │
   └── GET /api/application/:id
          └── Simulated status lookup


BACKEND
   │
   └── LLM API
          ├── Language understanding
          ├── Fact extraction
          ├── Conversation assistance
          └── Plain-language explanation

DATABASE / RULES
   ├── Scheme
   ├── Eligibility rules
   ├── User/demo context
   └── Application + status
```

This API surface is intentionally small and directly supports the MVP journey:

> **Describe → Ask → Check → Explain → Prepare → Review → Confirm → Submit → Track → Check status**
