# 06 — Architecture Decision

This document defines the minimum architectural capabilities required to implement the MVP described in `01-PROBLEM.md` through `05-MVP.md`.

No specific technology choices are made here.

---

# 1. Architecture Decisions

| Area | Decision | Status | Justification |
|---|---|---|---|
| **UI** | A citizen-facing conversational interface is required. | **REQUIRED** | The primary journey starts with the citizen describing their situation in plain language and continues through questions, eligibility, application review, submission, and status lookup. A chat/conversation interface directly supports this flow. |
| **Backend** | A backend service is required for scheme rules, application processing, agent orchestration, and simulated submission/status behavior. | **REQUIRED** | Eligibility rules and application/status records should not depend on client-side logic alone. The backend provides the controlled environment for the core business workflow. |
| **Database** | A minimal persistent data store is required for supported scheme information, eligibility/application data, and simulated application status. | **REQUIRED** | The demo must create an application, return a tracking ID, and allow the user to ask for its status later. That requires state to persist beyond a single interaction. |
| **API** | An internal API boundary is required between the UI and backend services. | **REQUIRED** | The frontend needs a controlled way to send conversation/application requests and receive results without directly owning scheme rules or persistence. It also gives the architecture a clear separation between presentation and business logic. |
| **AI** | AI is required for natural-language understanding and conversational interaction. | **REQUIRED** | The core product promise is that a citizen can describe their situation naturally and receive guided assistance instead of navigating government terminology and raw forms. |
| **Agent** | A lightweight agent/orchestration layer is required rather than treating the product as one isolated model call. | **REQUIRED** | The flow spans multiple turns and stages: understanding the situation, asking for missing information, invoking scheme/eligibility logic, preparing an application, and later retrieving status. The agent therefore needs state across turns and the ability to choose the next action. |
| **Auth** | Full user authentication is excluded from the MVP demo. | **NOT REQUIRED** | The MVP explicitly excludes full authentication, and the hackathon demo does not require production-grade identity management to demonstrate the core journey. A simple demo identity/session mechanism may still be needed internally, but it is not a product feature. |
| **Cloud deployment** | The MVP must be runnable locally; cloud deployment is optional. | **OPTIONAL** | The success criteria concern the demonstrated user journey, not production hosting. Cloud deployment can improve demo accessibility but is not necessary if the local demo is reliable. |

---

# 2. Architecture Interpretation

The resulting minimum architecture is:

```text
┌──────────────────────────────┐
│       Citizen-facing UI      │
│     Conversational chat      │
└──────────────┬───────────────┘
               │
               │ Internal API
               ▼
┌──────────────────────────────┐
│      Agent / Orchestrator    │
│                              │
│  Understand → Ask → Decide   │
│  → Prepare → Confirm → Act  │
└───────┬──────────┬───────────┘
        │          │
        │          │
        ▼          ▼
┌─────────────┐  ┌──────────────────┐
│ Scheme &    │  │ AI language      │
│ eligibility │  │ understanding    │
│ rules       │  │                  │
└──────┬──────┘  └──────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Minimal persistent data      │
│                              │
│ Scheme / Application /       │
│ Status / Conversation state  │
└──────────────────────────────┘
```

This is a conceptual architecture only. Specific frameworks, providers, databases, or deployment platforms are intentionally deferred.

---

# 3. Important Boundary: AI vs. Eligibility Rules

Although AI is **REQUIRED**, the architecture should not make the language model the sole authority for eligibility.

The preferred responsibility split is:

```text
Citizen's natural-language message
              ↓
        AI understands
              ↓
   Structured user facts
              ↓
   Defined scheme rules
              ↓
    Eligibility evaluation
              ↓
      Agent explains result
```

### Reason

The MVP requires trustworthy eligibility guidance. The eligibility result should be grounded in the defined rules for the single supported scheme rather than relying on an unrestricted model to invent or infer official eligibility requirements.

AI is therefore primarily responsible for **understanding, conversation, explanation, and application assistance**, while the scheme's defined rules provide the controlled basis for the eligibility evaluation.

---

# 4. Agent Requirement — What "Agent" Means for This MVP

The HOJATHON brief calls for AI agents, so the architecture should contain an actual multi-step agent workflow.

However, this does **not** mean building a complex autonomous agent framework.

For this MVP, the minimum useful agent behavior is:

1. Understand the citizen's situation.
2. Identify what information is missing.
3. Ask the next relevant question.
4. Maintain the facts collected across turns.
5. Invoke the appropriate scheme/eligibility logic.
6. Explain the result.
7. Prepare application information.
8. Wait for explicit user confirmation.
9. Trigger simulated submission.
10. Return or later retrieve the application status.

The agent may therefore use a small, controlled set of actions/tools such as:

- Evaluate eligibility.
- Prepare application.
- Submit simulated application.
- Retrieve application status.

The exact implementation is intentionally left undecided.

---

# 5. Memory Requirement

The agent needs **conversation/application state across turns**, but this should not be confused with building a sophisticated long-term memory system.

For the MVP, the required state is limited to information necessary to continue the current journey, such as:

- User-provided eligibility facts.
- Answers to follow-up questions.
- Selected scheme.
- Prepared application information.
- User corrections.
- Confirmation state.
- Tracking ID.
- Simulated application status.

The later status lookup also requires enough persistent information to associate the user/demo session with the submitted application.

---

# 6. Database Scope

The database is intentionally minimal.

At a conceptual level it needs to represent:

### Scheme

- Supported scheme.
- Eligibility criteria.
- Information needed for eligibility/application.

### Application

- Applicant/demo identity reference.
- Selected scheme.
- Submitted application information.
- Tracking ID.
- Submission state.

### Status

- Current simulated status.
- Information needed to retrieve/display that status.

### Conversation/Application State

- Facts collected during the current interaction.
- Information required to resume the application flow.

The exact schema is deferred to a later data-model document.

---

# 7. API Scope

The API is **internal**, not a public government integration.

Its purpose is to connect the citizen-facing UI to the application's controlled backend workflow.

Conceptually, the API needs to support operations corresponding to:

```text
Conversation / agent interaction
        ↓
Eligibility evaluation
        ↓
Application preparation
        ↓
Application confirmation/submission
        ↓
Tracking/status retrieval
```

There is **no requirement for a public API** or external government API integration in the MVP.

---

# 8. Authentication Decision

Full authentication is deliberately excluded.

The MVP's purpose is to demonstrate:

> **Situation → Eligibility → Application → Simulated Submission → Tracking → Status**

not identity verification.

However, the system may still need a simple mechanism to maintain a demo user's application state during the session. That mechanism should not grow into a full authentication feature unless the requirements change.

---

# 9. Cloud Deployment Decision

Local execution is sufficient for the MVP.

Cloud deployment may be useful if it makes the hackathon demonstration easier to access or share, but it is not part of the product's core acceptance criteria.

Therefore:

> **Build for a reliable local demo first; deploy to the cloud only if time and stability permit.**

---

# 10. Architecture Scope Guardrails

The following should **not** be added merely to make the architecture sound more sophisticated:

### ❌ Complex multi-agent system

The MVP has one focused journey. Multiple specialized agents are unnecessary unless a concrete requirement emerges.

### ❌ Autonomous long-running agent

The agent does not need to operate independently for hours or perform background tasks. The required interaction is bounded and user-driven.

### ❌ Sophisticated long-term memory

The MVP only needs conversation and application state required to complete the journey and retrieve a submitted application later.

### ❌ Public API platform

The backend API exists to serve the prototype UI, not to expose a reusable government-services platform.

### ❌ Real government integration

This is explicitly excluded by the MVP constraints.

### ❌ Production-grade authentication

Full authentication is explicitly excluded from the MVP.

### ❌ Microservices

The requirements do not justify splitting this small MVP into multiple independently deployed services.

### ❌ Complex infrastructure

The architecture should optimize for a reliable five-hour hackathon demonstration, not production-scale deployment.

---

# 11. Final Architecture Decision

The minimum architecture is:

| Capability | Decision |
|---|---|
| Citizen-facing conversational UI | **REQUIRED** |
| Backend business logic | **REQUIRED** |
| Scheme/eligibility rules | **REQUIRED** |
| Minimal persistence | **REQUIRED** |
| Internal API boundary | **REQUIRED** |
| AI language understanding | **REQUIRED** |
| Multi-turn agent/orchestration | **REQUIRED** |
| Conversation/application state | **REQUIRED** |
| Full authentication | **NOT REQUIRED** |
| Cloud deployment | **OPTIONAL** |
| Real government API integration | **EXCLUDED** |
| Multiple schemes simultaneously | **EXCLUDED** |
| OCR/document processing | **EXCLUDED** |
| Multilingual UI | **EXCLUDED** |

## Architecture principle

> **Use the minimum architecture necessary to make the agent genuinely useful and the end-to-end citizen journey reliable.**

The architecture should support the product—not become a separate demonstration of technical complexity.
