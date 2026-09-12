# 05 — MVP Definition

## 1. MVP Objective

The MVP demonstrates a focused Public Services & Civic Agents experience in which a citizen can move from describing their real-life situation to completing a **simulated government welfare application** without needing to understand a raw government form or complicated administrative procedure.

The MVP will use **one demonstration welfare scheme** with **3–4 simple eligibility criteria**.

The core experience is:

> **Describe my situation → Answer a few questions → Understand whether I qualify → Review my application → Confirm → Simulated submission → Get tracking ID → Check status later**

The MVP is intentionally narrow. Its purpose is to prove the end-to-end citizen journey rather than provide a complete government-services catalog.

---

# 2. MVP Scope

## 2.1 Supported Scheme

The MVP supports:

- **One welfare scheme**
- **3–4 simple eligibility criteria**
- Eligibility criteria that can be expressed clearly and checked using information provided by the citizen.

Possible criterion types include:

- Age
- Income bracket
- Land ownership
- Residency

These are examples from the MVP brief. The exact scheme and authoritative criteria must be selected before implementation.

### Scheme selection requirement

The selected scheme must have sufficiently clear eligibility rules to support a convincing demonstration of:

1. Scheme relevance
2. Eligibility questioning
3. Eligibility confirmation
4. Application preparation
5. Simulated submission
6. Status tracking

The prototype must not present example criteria as official rules until the actual demonstration scheme and its rules have been established.

---

# 3. In-Scope P0 Features

The MVP includes the following P0 capabilities from `04-FEATURES.md`.

| Feature | Purpose |
|---|---|
| **F-001 Plain-Language Need Chat** | Lets the citizen describe their situation without starting from a government form. |
| **F-002 Supported Scheme Matching** | Determines whether the supported scheme is relevant to the citizen's situation. |
| **F-003 Guided Eligibility Checker** | Asks for the missing facts required to evaluate eligibility. |
| **F-004 Eligibility Explanation** | Clearly communicates the eligibility result and relevant reason. |
| **F-005 Application Autofill** | Builds the application from information already provided by the citizen. |
| **F-006 Application Review & Confirmation** | Lets the citizen review and correct the prepared application before submission. |
| **F-007 Simulated Submission** | Demonstrates submission without connecting to a real government backend. |
| **F-008 Application Tracking ID** | Gives the citizen a reference for the submitted simulated application. |
| **F-009 Conversational Status Lookup** | Lets the citizen ask for their application status later. |
| **F-012 Plain-Language Conversation** | Keeps the entire citizen-facing journey understandable. |
| **F-013 Simulation Transparency** | Makes it clear that submission and status are simulated. |

### Supporting P1 behavior included where necessary

The MVP should also handle:

- **F-010 Non-Eligibility Guidance** — because an ineligible user is an important demonstration path.
- **F-011 Out-of-Scope Request Handling** — because the MVP intentionally supports only one scheme.

These are not part of the primary happy path but should be demonstrated where practical.

---

# 4. Primary User Flow

## Overview

```text
1. User describes situation
            ↓
2. Agent understands the need
            ↓
3. Agent asks 2–3 missing questions
            ↓
4. Agent evaluates eligibility
            ↓
5. Agent explains eligibility
            ↓
6. Agent prepares the application
            ↓
7. User reviews and corrects
            ↓
8. User confirms
            ↓
9. Agent performs simulated submission
            ↓
10. Tracking ID is returned
            ↓
11. User later asks for status
            ↓
12. Simulated status is shown
```

---

## Step 1 — Describe Situation

### User action

The citizen explains their situation in ordinary language.

Example:

> "I am 62 years old, I live here permanently, and my monthly income is low. I want to know if I can get government support."

### Required input

- Free-form description of the user's situation.

### Expected output

The agent acknowledges the situation and determines what additional information may be needed.

### UX principle

The citizen should not have to know the scheme name or government form structure before starting.

---

## Step 2 — Identify Missing Facts

### Agent action

The agent determines which eligibility facts are not yet known.

The MVP should ask approximately **2–3 missing questions** in the primary demo scenario rather than presenting the complete application form immediately.

### Possible questions

Depending on the selected scheme:

- What is your age?
- What is your income bracket?
- Do you own agricultural land?
- Do you meet the required residency condition?

### Required input

- User's answers to the necessary eligibility questions.

### Expected output

A sufficiently complete set of facts to evaluate the supported scheme.

### Important boundary

The exact questions depend on the selected scheme. The MVP should not ask unnecessary questions that do not contribute to the eligibility decision or application.

---

## Step 3 — Confirm Eligibility

### Agent action

The service evaluates the collected information against the defined eligibility criteria.

### Possible outcomes

1. **Likely eligible**
2. **Not eligible**
3. **More information needed**

### Expected output

A clear eligibility result.

For an eligible user, the agent should explain the important conditions that were satisfied.

For an ineligible user, the agent should explain the relevant condition that was not satisfied.

---

## Step 4 — Show Filled Application

### Agent action

The service uses information already collected during the conversation to prepare the application.

### Required input

- Selected scheme
- User-provided information
- Eligibility information required for the application

### Expected output

A filled application preview.

### Important UX requirement

The citizen should see the application **before submission**.

The user should not be expected to manually re-enter information that has already been collected when that information can be reused.

---

## Step 5 — User Reviews and Confirms

### User action

The citizen reviews the prepared application.

They can:

- Inspect the information.
- Correct incorrect information.
- Confirm that the application is ready.

### Required input

- User confirmation.

### Expected output

A confirmed application ready for simulated submission.

### Critical boundary

**No submission occurs before user confirmation.**

---

## Step 6 — Simulated Submission

### Agent/system action

The prototype records the confirmed application as a simulated submission.

### Required input

- User-confirmed application.

### Expected output

- Submission confirmation.
- Tracking ID.

### Transparency requirement

The experience must clearly state that this is a **hackathon simulation** and that no real government application has been submitted.

---

## Step 7 — Tracking ID

### User receives

A unique tracking ID associated with the simulated application.

Example:

> **Application submitted successfully**  
> Tracking ID: `DEMO-XXXXXX`  
> Status: Simulated — Received

The exact ID format is an implementation decision and is not defined by this MVP document.

---

## Step 8 — Later Status Lookup

### User action

The citizen returns later and asks something such as:

> "What's my status?"

### Agent action

The service finds the relevant simulated application and retrieves its simulated status.

### Expected output

The user sees:

- Application identifier.
- Current simulated status.
- Any relevant status information.

### Important boundary

The service must not invent a status for an application that cannot be found.

---

# 5. Required Inputs and Outputs

## 5.1 User Inputs

The MVP requires:

| Input | Purpose |
|---|---|
| Plain-language situation | Understand the citizen's need |
| Eligibility facts | Determine whether the user qualifies |
| Answers to missing questions | Complete the eligibility information |
| Corrections to application information | Ensure the prepared application reflects the user's actual information |
| Confirmation | Authorize simulated submission |
| Later status request | Retrieve the simulated application status |

The exact fields depend on the selected demonstration scheme.

---

## 5.2 Agent/System Outputs

The MVP produces:

| Output | Purpose |
|---|---|
| Clarifying questions | Collect missing eligibility information |
| Scheme relevance result | Identify whether the supported scheme appears applicable |
| Eligibility result | Tell the citizen whether they appear eligible |
| Eligibility explanation | Explain why |
| Filled application preview | Let the citizen review the application |
| Simulated submission confirmation | Confirm the prototype recorded the application |
| Tracking ID | Allow later identification of the application |
| Simulated status | Give the citizen visibility after submission |

---

# 6. What Is Excluded

The following are explicitly **not built in the MVP**.

## 6.1 Real Government API Integration

The prototype will not connect to real government backend systems.

Therefore:

- No real application will be submitted.
- No real government database will be queried.
- No real government application status will be retrieved.

All submission and status behavior is simulated.

---

## 6.2 Multiple Schemes at Once

The MVP supports **one demonstration scheme**.

It will not attempt to provide a broad government scheme catalog or simultaneously process multiple schemes.

This keeps the demonstration focused on the quality of the end-to-end journey.

---

## 6.3 OCR or Document Upload

The MVP will not include:

- Document upload.
- Document scanning.
- OCR.
- Automatic extraction from identity/income/land documents.

---

## 6.4 Multilingual UI

The MVP will not implement a multilingual user interface.

Multilingual support remains a future feature unless requirements are explicitly changed.

---

## 6.5 Full Authentication

The MVP will not build a full authentication experience.

Authentication is outside this product-scope definition. If the demonstration environment requires a minimal identity mechanism, that should be treated as implementation infrastructure rather than a core product feature.

---

## 6.6 Agent-Initiated Follow-Up Reminders

Proactive reminders are not part of the core MVP flow.

The user-initiated status lookup is the required tracking interaction.

---

# 7. Demo Scenario

The demo should show **both a successful eligible journey and a meaningful ineligible journey**.

## Scenario A — Eligible User

### User situation

A citizen describes a situation that satisfies all required criteria for the selected demonstration scheme.

For example:

> "I am 62 years old, my income is within the required range, I meet the residency requirement, and I want to apply for this support."

### Flow

```text
Citizen describes situation
        ↓
Agent identifies missing information
        ↓
Agent asks 2–3 questions
        ↓
Citizen provides answers
        ↓
Agent checks the scheme criteria
        ↓
Agent: "You appear eligible because..."
        ↓
Agent prepares application
        ↓
Citizen reviews application
        ↓
Citizen corrects/confirms information
        ↓
Citizen confirms
        ↓
Simulated submission
        ↓
Tracking ID returned
        ↓
Later: "What's my status?"
        ↓
Simulated status displayed
```

### What the demo proves

This scenario demonstrates the complete P0 journey:

**Need → Eligibility → Application → Confirmation → Submission → Tracking**

---

## Scenario B — Ineligible User

### User situation

A citizen describes a situation that fails at least one required eligibility criterion.

For example:

> "I am below the required age and want to know if I can receive this benefit."

The exact value and criterion must correspond to the selected demonstration scheme.

### Flow

```text
Citizen describes situation
        ↓
Agent asks necessary questions
        ↓
Agent checks eligibility
        ↓
Agent: "You do not appear eligible because..."
        ↓
Agent explains the relevant condition
        ↓
Where supported by the rules:
Agent explains what would need to be different
```

### What the demo proves

This scenario demonstrates that the product does not simply say "No."

It provides an understandable explanation and does not invent another scheme or unsupported eligibility rule.

### Important boundary

The agent must not imply that the citizen can become eligible by changing a fact when the actual scheme rules do not support that conclusion.

---

# 8. MVP Success Criteria

The MVP is successful if a demo user can complete the primary journey without being required to understand or manually navigate a raw government application form.

## Primary success criterion

> **A citizen describes their situation in plain language and reaches a submitted simulated application with a tracking ID, then can later ask for and receive its simulated status.**

## Functional success criteria

The demo must show that:

- The citizen can start with a plain-language description.
- The agent asks only the necessary missing questions.
- The supported scheme is evaluated using its defined eligibility criteria.
- The agent clearly explains the eligibility result.
- The application is prepared from information already provided.
- The user can review and correct the application.
- Submission requires explicit user confirmation.
- Submission is clearly simulated.
- A tracking ID is returned.
- The user can later request the application status.
- The status is clearly simulated.
- The ineligible path is handled clearly.
- Unsupported requests are not fabricated into supported services.

## Experience success criteria

The experience should feel:

- **Simple** — the citizen does not need to understand government jargon.
- **Conversational** — the user provides information progressively rather than filling a raw form first.
- **Transparent** — AI interpretation and simulation are not presented as official government decisions or transactions.
- **User-controlled** — the citizen reviews the application before submission.
- **End-to-end** — the demo covers discovery, eligibility, application, submission, and tracking.
- **Focused** — one scheme is demonstrated deeply rather than several schemes superficially.

---

# 9. MVP Boundary

The MVP can be summarized as:

> **One scheme + a few clear eligibility rules + conversational eligibility checking + application generation + human confirmation + simulated submission + tracking.**

Anything beyond that should require an explicit change to the requirements and MVP scope.

## Core demo path

**Situation → Questions → Eligibility → Application → Review → Confirm → Simulated Submit → Tracking → Status**

This is the journey the hackathon implementation should optimize for.
