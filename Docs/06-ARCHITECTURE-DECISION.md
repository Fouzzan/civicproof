# CivicProof — Architecture Decision

## Purpose

This document decides **what kinds of system components CivicProof needs for the MVP**.

It intentionally does **not** choose specific technologies or vendors. Technology selection comes later.

The decision is based on `docs/01-PROBLEM.md` through `docs/05-MVP.md`.

---

## Architecture Decision Summary

| Component | Decision | Why |
|---|---|---|
| **UI** | **REQUIRED** | The MVP is a user-facing reporting and case-tracking product with separate citizen and authority workflows, plus a mobile-friendly citizen experience. |
| **Backend** | **REQUIRED** | The MVP needs trusted server-side handling for cases, evidence associations, permissions, status updates, and the distinction between prototype state and official submission. |
| **Database (persistent data)** | **REQUIRED** | Cases need to persist beyond the report-creation screen so a case ID can retrieve the case, timelines can be maintained, and authority updates/resolution can be reflected to the citizen. |
| **API** | **REQUIRED** | The UI needs a controlled way to communicate with backend capabilities such as creating cases, requesting AI analysis, uploading/associating evidence, and updating case status. |
| **AI** | **REQUIRED** | AI-assisted case structuring, severity suggestion, reporting-direction assistance, and complaint generation are explicit P0 MVP capabilities and are central to the product's value proposition. |
| **Agents (multi-step, tool-using AI)** | **NOT REQUIRED** | The MVP needs AI assistance, but its required tasks can be handled as bounded AI operations. A multi-step autonomous agent would add complexity without being necessary to prove the core workflow. |
| **External integrations** | **OPTIONAL** | The MVP must provide a legitimate official reporting handoff, but it does not need direct integration with every authority. An integration is valuable only where a real, supported channel exists. |
| **Authentication** | **REQUIRED** | The MVP contains private sensitive cases and authority-only actions, so the system needs a way to distinguish users and enforce permission-aware access. |
| **Cloud deployment** | **OPTIONAL** | A deployed product makes the hackathon demo easier to share and test across devices, but cloud deployment is not logically required to prove the MVP if the system can run locally. |
| **Background processing** | **NOT REQUIRED** | Nothing in the MVP requires long-running or scheduled work. The core journey can complete through user-triggered operations; asynchronous processing can be added later if evidence/AI workloads demand it. |

---

# 1. UI — REQUIRED

The MVP cannot exist as a backend-only system because its core value is an end-to-end user workflow.

The UI must support at least:

- Citizen incident creation
- Incident type selection
- Incident details
- Evidence upload
- AI analysis results
- Severity suggestion
- Reporting direction
- Complaint review
- Official handoff
- Case ID and timeline
- Authority case review
- Authority status/resolution updates
- Immediate safety guidance
- Private handling indicators
- Mobile-friendly citizen interaction

This directly follows the MVP's citizen and authority flows and the requirement for a mobile-friendly citizen experience. The MVP specifically defines the user journey from incident creation through resolution. 

**Decision:** REQUIRED

---

# 2. Backend — REQUIRED

The MVP needs trusted application logic behind the UI.

The backend is responsible for things such as:

- Creating and retrieving cases
- Generating case identifiers
- Associating evidence with the correct case
- Applying sensitivity/privacy rules
- Enforcing authority-only operations
- Recording case status and timeline events
- Recording resolution
- Calling AI capabilities without exposing secrets to the client
- Representing complaint/handoff states honestly

This is especially important because privacy, permission-aware access, data integrity, and truthful case-state representation are P0 requirements.

A purely client-side implementation would make those controls difficult to trust and would not provide an appropriate boundary for sensitive case data.

**Decision:** REQUIRED

---

# 3. Database / Persistent Data — REQUIRED

The MVP explicitly requires a case to survive beyond the initial report.

Persistent information includes at minimum:

- Case ID
- Incident type
- Incident details
- Sensitivity/privacy state
- Evidence references
- AI-assisted analysis
- Severity suggestion
- Reporting direction
- Complaint draft/state
- Handoff/submission state
- Current case status
- Timeline events
- Authority updates
- Resolution information

The citizen must be able to view a case after creation, while an authority must be able to review and update the same case. That requires persistent shared state.

**Decision:** REQUIRED

---

# 4. API — REQUIRED

The MVP needs a controlled communication boundary between the UI and server-side capabilities.

The API layer needs to support operations such as:

- Create/read a case
- Upload or associate evidence
- Request AI analysis
- Generate a complaint
- Retrieve case status/timeline
- Perform authority status updates
- Record resolution
- Apply access checks

This does **not** mean the MVP needs a large public API platform or a collection of microservices.

A small internal application API is sufficient.

**Important distinction:** API is REQUIRED as a communication mechanism; a **public/developer API is NOT REQUIRED**.

**Decision:** REQUIRED

---

# 5. AI — REQUIRED

AI is not merely a decorative enhancement in this MVP.

The requirements explicitly make AI-assisted incident structuring a P0 capability, and the MVP uses AI to:

1. Structure the user's description
2. Summarize the incident
3. Suggest severity
4. Help identify a reporting direction
5. Generate a formal complaint draft

AI output must remain distinguishable from user-provided or verified information.

AI must **not**:

- Determine guilt
- Determine criminal liability
- Invent facts
- Invent evidence
- Invent laws
- Invent authorities
- Claim an official submission
- Claim authority acknowledgment or resolution without an actual recorded state

Therefore, AI is a core component, but it should be deliberately bounded.

**Decision:** REQUIRED

---

# 6. Agents / Multi-Step Tool-Using AI — NOT REQUIRED

The MVP does not require an autonomous agent.

The required AI behavior is primarily a set of bounded transformations:

```text
User information
      ↓
AI structure/summarize
      ↓
Severity suggestion
      ↓
Reporting-direction assistance
      ↓
Complaint draft
```

These operations do not require an AI system that independently plans actions, chooses tools, executes external operations, and continues until a goal is reached.

Adding an agent would increase:

- Implementation complexity
- Debugging difficulty
- Failure modes
- Safety concerns
- Demo risk

without proving more of the MVP.

**This is a classic "sounds impressive" component that should be rejected for the hackathon MVP.**

**Decision:** NOT REQUIRED

---

# 7. External Integrations — OPTIONAL

The MVP requires a legitimate path toward an official reporting channel, but it explicitly does **not** require integration with every government or authority system.

The minimum viable behavior can therefore be:

```text
Complaint Draft
      ↓
Ready for Official Handoff
      ↓
Official Channel / Handoff
      ↓
Confirmed Submission
     only if genuinely confirmed
```

A real external integration could make the product stronger if an appropriate, supported channel is available. However, inventing or simulating an official submission would violate the MVP's truthfulness requirement.

Therefore:

- **Official-channel handoff:** REQUIRED
- **Direct external-system integration:** OPTIONAL
- **Fake/pretended official integration:** NOT ALLOWED

External integrations should be added only when they materially improve the real workflow.

**Decision:** OPTIONAL

---

# 8. Authentication — REQUIRED

Authentication is required because the MVP has different classes of users and sensitive information.

At minimum, the system needs to distinguish:

```text
Citizen / Reporter
        ≠
Authority User
```

It also needs to protect sensitive cases and evidence from unauthorized access.

The requirements explicitly call for:

- Private sensitive cases
- Permission-aware access
- Authority-only operations
- Restricted sensitive evidence
- No public exposure of sensitive reports

A demo-only hardcoded role switch may be useful for rapidly demonstrating the concept, but the architecture still needs an **authentication/identity boundary**. Otherwise the privacy and authority-permission requirements are not meaningfully represented.

For the hackathon, the implementation can be deliberately lightweight, but authentication should not be confused with a public registration system.

**Decision:** REQUIRED

---

# 9. Cloud Deployment — OPTIONAL

Cloud deployment is useful for a hackathon because it allows:

- Judges to access the product from a link
- Testing on multiple devices
- Easy sharing between teammates
- Demonstration of the mobile citizen workflow
- A more realistic product presentation

However, cloud deployment is not part of the core problem being solved.

The MVP can technically be demonstrated locally if necessary.

Therefore cloud deployment is an **enabler for demonstration and usability**, not a fundamental product requirement.

**Decision:** OPTIONAL

---

# 10. Background Processing — NOT REQUIRED

The MVP does not define any task that must continue running after the user leaves the current interaction.

The primary operations are user-triggered:

- Submit incident
- Analyze with AI
- Generate complaint
- Create case
- Update status
- Record resolution

None inherently requires scheduled jobs, queues, workers, or long-running background tasks.

For the four-hour hackathon, introducing background processing would add infrastructure and failure modes without improving the proof of concept.

Potential future reasons to add it could include:

- Large video processing
- Heavy evidence analysis
- Notifications
- Scheduled escalation
- Batch processing
- External-system synchronization

Those are outside the current MVP.

**Decision:** NOT REQUIRED

---

# Architecture Boundary for the MVP

The smallest architecture that supports the MVP is therefore:

```text
                 ┌─────────────────────┐
                 │         UI          │
                 │ Citizen + Authority │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │        API          │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌─────────────┐
      │  Backend   │ │     AI     │ │  Database   │
      │  Logic     │ │ Assistance │ │  Persistent │
      └────────────┘ └────────────┘ └─────────────┘
             │
             ▼
      ┌────────────────────┐
      │ External handoff   │
      │ / integrations     │
      │     (optional)     │
      └────────────────────┘
```

Authentication/authorization is a **cross-cutting boundary** around protected case and authority operations.

Background processing and autonomous agents are deliberately outside this MVP architecture.

---

# Strict Anti-Overengineering Check

The following components should **not** be added merely to make the architecture sound more advanced:

| Tempting Addition | MVP Decision | Reason |
|---|---|---|
| Autonomous AI agents | **NOT REQUIRED** | Bounded AI operations are sufficient. |
| Microservices | **NOT REQUIRED** | The MVP does not need independently scalable services. |
| Message queues | **NOT REQUIRED** | No required long-running/background workflow exists. |
| Event streaming infrastructure | **NOT REQUIRED** | A normal persisted case timeline is sufficient. |
| Public developer API | **NOT REQUIRED** | The API is only needed for the application's own UI/backend communication. |
| Full government API ecosystem | **NOT REQUIRED** | Official handoff is enough when direct integration is unavailable. |
| Native mobile application | **NOT REQUIRED** | The requirement is mobile-friendly usage, not a native app. |
| Advanced evidence-forensics pipeline | **NOT REQUIRED** | The MVP only needs evidence attachment and review. |
| Advanced legal engine | **NOT REQUIRED** | Regulatory context is P1 and must remain contextual, not a legal decision engine. |
| Public incident/social network | **NOT REQUIRED** | It is outside the MVP and conflicts with sensitive-case privacy. |
| Real-time chat | **NOT REQUIRED** | Case updates are sufficient for the MVP. |
| Automated escalation | **NOT REQUIRED** | Explicitly outside the MVP feature set. |

---

# Final Decision

## Required

- **UI**
- **Backend**
- **Persistent database**
- **API**
- **AI**
- **Authentication**

## Optional

- **External integrations**
- **Cloud deployment**

## Not Required

- **Agents / multi-step tool-using AI**
- **Background processing**

The MVP should therefore be built as a **small full-stack application with persistent case state, protected user roles, bounded AI assistance, and an honest official-handoff workflow**.

The architecture should optimize for one thing:

> **Reliably demonstrate the complete incident → evidence → AI assistance → complaint → handoff → case tracking → authority update → resolution journey.**

Anything that does not directly help prove that journey should be deferred.
